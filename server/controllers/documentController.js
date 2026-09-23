// server/controllers/documentController.js
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { query } from '../config/db.js';
import { uploadDocumentSchema, updateDocumentSchema } from '../validation/schemas.js';
import { processDocumentIngestion } from '../services/ingestionService.js';
import { logAudit } from '../services/auditService.js';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration with sanitized filenames and random UUID prefix
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|txt)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, DOCX, and TXT files are accepted.'), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_UPLOAD_MB, 10) || 50) * 1024 * 1024 },
});

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded.' });
    }

    const validated = uploadDocumentSchema.parse(req.body);
    const docType = validated.documentType || validated.document_type || 'case_file';
    const { title, jurisdiction, confidentialityTag } = validated;
    const { caseId } = req.params;

    // Verify case belongs to firm
    const caseCheck = await query(
      'SELECT id FROM cases WHERE id = $1 AND firm_id = $2',
      [caseId, req.firmId],
      req.firmId
    );
    if (caseCheck.rows.length === 0) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    const docResult = await query(
      `INSERT INTO documents (case_id, firm_id, uploaded_by, title, document_type, jurisdiction, confidentiality_tag, file_path, ingestion_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [
        caseId,
        req.firmId,
        req.user.id,
        title,
        docType,
        jurisdiction || null,
        confidentialityTag || 'privileged',
        req.file.path,
      ],
      req.firmId
    );

    const doc = docResult.rows[0];

    await logAudit({
      firmId: req.firmId,
      caseId,
      userId: req.user.id,
      action: 'DOCUMENT_UPLOADED',
      metadata: { documentId: doc.id, title: doc.title, documentType: doc.document_type },
    });

    // Ingest synchronously so chunks and embeddings are immediately available
    try {
      await processDocumentIngestion(doc.id, req.firmId, req.user.id);
      const updatedDoc = await query(
        `SELECT d.*, COUNT(c.id)::int as chunk_count
         FROM documents d
         LEFT JOIN document_chunks c ON c.document_id = d.id
         WHERE d.id = $1
         GROUP BY d.id`,
        [doc.id],
        req.firmId
      );
      return res.status(201).json({
        message: 'Document uploaded and indexed successfully.',
        document: updatedDoc.rows[0],
      });
    } catch (ingestError) {
      console.error('[INGESTION RUNTIME ERROR]', ingestError);
      return res.status(201).json({
        message: 'Document uploaded, but indexing encountered an issue.',
        document: { ...doc, ingestion_status: 'failed' },
        warning: ingestError.message,
      });
    }
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(err);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const { caseId } = req.params;
    const result = await query(
      `SELECT d.*, u.full_name as uploaded_by_name,
              COUNT(c.id)::int as chunk_count
       FROM documents d
       LEFT JOIN users u ON u.id = d.uploaded_by
       LEFT JOIN document_chunks c ON c.document_id = d.id
       WHERE d.case_id = $1 AND d.firm_id = $2
       GROUP BY d.id, u.full_name
       ORDER BY d.created_at DESC`,
      [caseId, req.firmId],
      req.firmId
    );

    res.json({ documents: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getDocumentById(req, res, next) {
  try {
    const { caseId, docId } = req.params;
    const result = await query(
      `SELECT d.*, u.full_name as uploaded_by_name,
              COUNT(c.id)::int as chunk_count
       FROM documents d
       LEFT JOIN users u ON u.id = d.uploaded_by
       LEFT JOIN document_chunks c ON c.document_id = d.id
       WHERE d.id = $1 AND d.case_id = $2 AND d.firm_id = $3
       GROUP BY d.id, u.full_name`,
      [docId, caseId, req.firmId],
      req.firmId
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.json({ document: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const { caseId, docId } = req.params;
    const docResult = await query(
      'SELECT id, title, file_path FROM documents WHERE id = $1 AND case_id = $2 AND firm_id = $3',
      [docId, caseId, req.firmId],
      req.firmId
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found or access denied.' });
    }

    const doc = docResult.rows[0];

    // Delete record (cascades chunks)
    await query('DELETE FROM documents WHERE id = $1', [doc.id], req.firmId);

    // Delete physical file safely
    if (doc.file_path && fs.existsSync(doc.file_path)) {
      try { fs.unlinkSync(doc.file_path); } catch (e) {}
    }

    await logAudit({
      firmId: req.firmId,
      caseId,
      userId: req.user.id,
      action: 'DOCUMENT_DELETED',
      metadata: { documentId: doc.id, title: doc.title },
    });

    res.json({ message: 'Document deleted successfully.', deletedId: doc.id });
  } catch (err) {
    next(err);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const { caseId, docId } = req.params;
    const docResult = await query(
      'SELECT id, title, file_path FROM documents WHERE id = $1 AND case_id = $2 AND firm_id = $3',
      [docId, caseId, req.firmId],
      req.firmId
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const doc = docResult.rows[0];
    if (!fs.existsSync(doc.file_path)) {
      return res.status(404).json({ error: 'Document file not found on disk.' });
    }

    const ext = path.extname(doc.file_path) || '.pdf';
    const downloadName = `${doc.title.replace(/[^a-zA-Z0-9_\-\.]/g, '_')}${ext}`;

    res.download(doc.file_path, downloadName);
  } catch (err) {
    next(err);
  }
}

export async function updateDocument(req, res, next) {
  try {
    const { caseId, docId } = req.params;
    const validated = updateDocumentSchema.parse(req.body);
    const docType = validated.documentType || validated.document_type;

    const existing = await query(
      'SELECT id, title, document_type, confidentiality_tag, jurisdiction FROM documents WHERE id = $1 AND case_id = $2 AND firm_id = $3',
      [docId, caseId, req.firmId],
      req.firmId
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const current = existing.rows[0];
    const newTitle = validated.title !== undefined ? validated.title : current.title;
    const newDocType = docType !== undefined ? docType : current.document_type;
    const newJurisdiction = validated.jurisdiction !== undefined ? validated.jurisdiction : current.jurisdiction;
    const newConfidentiality = validated.confidentialityTag !== undefined ? validated.confidentialityTag : current.confidentiality_tag;

    await query(
      `UPDATE documents
       SET title = $1, document_type = $2, jurisdiction = $3, confidentiality_tag = $4
       WHERE id = $5 AND firm_id = $6`,
      [newTitle, newDocType, newJurisdiction, newConfidentiality, docId, req.firmId],
      req.firmId
    );

    const updatedDocRes = await query(
      `SELECT d.*, u.full_name as uploaded_by_name,
              COUNT(c.id)::int as chunk_count
       FROM documents d
       LEFT JOIN users u ON u.id = d.uploaded_by
       LEFT JOIN document_chunks c ON c.document_id = d.id
       WHERE d.id = $1
       GROUP BY d.id, u.full_name`,
      [docId],
      req.firmId
    );

    await logAudit({
      firmId: req.firmId,
      caseId,
      userId: req.user.id,
      action: 'DOCUMENT_UPDATED',
      metadata: {
        documentId: docId,
        previousType: current.document_type,
        newType: newDocType,
      },
    });

    res.json({
      message: 'Document updated successfully.',
      document: updatedDocRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

