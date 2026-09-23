// server/services/ingestionService.js
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { query } from '../config/db.js';
import { generateEmbedding } from './embeddingService.js';
import { logAudit } from './auditService.js';

/**
 * Extract pages and text from an uploaded file
 * @param {string} filePath - Absolute or relative path to file on disk
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Array<{pageNumber: number, text: string}>>}
 */
export async function extractPages(filePath, mimeType) {
  const fileBuffer = fs.readFileSync(filePath);

  if (mimeType === 'application/pdf') {
    const pages = [];
    const pagerender = (pageData) => {
      return pageData.getTextContent().then((textContent) => {
        let lastY, text = '';
        for (const item of textContent.items) {
          if (lastY === item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        pages.push({
          pageNumber: pageData.pageIndex + 1,
          text: text.trim(),
        });
        return text;
      });
    };

    try {
      await pdfParse(fileBuffer, { pagerender });
      if (pages.length > 0) {
        // Deterministically sort pages by pageNumber in case promises resolved asynchronously
        pages.sort((a, b) => a.pageNumber - b.pageNumber);
        return pages.filter((p) => (p.text && p.text.trim().length > 0));
      }
    } catch (e) {
      console.warn('[PDF PARSE WARNING] Custom pagerender failed, falling back to default text parsing:', e.message);
    }

    // Fallback: standard pdf-parse with form feed and header splits
    const data = await pdfParse(fileBuffer);
    const rawPages = data.text.split(/\f|\n\s*---\s*Page\s*\d+\s*---\s*\n|\n={3,}\s*PAGE\s*\d+\s*={3,}|\nPAGE\s*\d+\s*\n={3,}/i);
    return rawPages.map((pageText, index) => ({
      pageNumber: index + 1,
      text: pageText.trim(),
    })).filter((p) => p.text.length > 0);
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filePath.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const fullText = result.value || '';
    // DOCX files do not have explicit page markers in raw text; split on form feeds or approximate ~2500 chars/page
    const docxPages = splitIntoPages(fullText, 2500);
    return docxPages;
  }

  // Plain Text / Default
  const textContent = fileBuffer.toString('utf-8');
  return splitIntoPages(textContent, 2500);
}

/**
 * Split continuous text into logical page boundaries
 */
function splitIntoPages(text, charsPerPage = 2500) {
  if (!text || text.trim().length === 0) return [];

  // Check for explicit page separators (including PAGE 1\n====== or === PAGE 1 ===)
  const explicitPages = text.split(/\f|\n={3,}\s*PAGE\s*\d+\s*={3,}|\nPAGE\s*\d+\s*\n={3,}|\n--- Page \d+ ---|\n=== PAGE \d+ ===/i);
  if (explicitPages.length > 1) {
    return explicitPages.map((p, i) => ({
      pageNumber: i + 1,
      text: p.trim(),
    })).filter((p) => p.text.length > 0);
  }

  const pages = [];
  let remaining = text.trim();
  let pageNum = 1;

  while (remaining.length > 0) {
    let splitIdx = charsPerPage;
    if (remaining.length <= charsPerPage) {
      pages.push({ pageNumber: pageNum++, text: remaining.trim() });
      break;
    }

    // Try finding a paragraph break or sentence break near charsPerPage
    const lastParagraph = remaining.lastIndexOf('\n\n', charsPerPage);
    const lastSentence = remaining.lastIndexOf('. ', charsPerPage);

    if (lastParagraph > charsPerPage * 0.6) {
      splitIdx = lastParagraph + 2;
    } else if (lastSentence > charsPerPage * 0.6) {
      splitIdx = lastSentence + 2;
    }

    pages.push({
      pageNumber: pageNum++,
      text: remaining.substring(0, splitIdx).trim(),
    });
    remaining = remaining.substring(splitIdx).trim();
  }

  return pages.filter((p) => p.text.length > 0);
}

/**
 * Chunk a single page into overlapping chunks
 * @param {string} pageText
 * @param {number} pageNumber
 * @param {number} chunkSize - Characters per chunk (~600)
 * @param {number} overlap - Overlap characters (~120)
 * @returns {Array<{pageNumber: number, content: string}>}
 */
export function chunkPage(pageText, pageNumber, chunkSize = 600, overlap = 120) {
  const chunks = [];
  if (!pageText || pageText.trim().length === 0) return chunks;

  const cleanText = pageText.replace(/\r\n/g, '\n').trim();

  if (cleanText.length <= chunkSize) {
    chunks.push({ pageNumber, content: cleanText });
    return chunks;
  }

  let start = 0;
  while (start < cleanText.length) {
    let end = start + chunkSize;
    if (end >= cleanText.length) {
      chunks.push({
        pageNumber,
        content: cleanText.substring(start).trim(),
      });
      break;
    }

    // Look for sentence or whitespace boundary
    const boundary = cleanText.lastIndexOf(' ', end);
    const actualEnd = boundary > start + chunkSize * 0.7 ? boundary : end;

    chunks.push({
      pageNumber,
      content: cleanText.substring(start, actualEnd).trim(),
    });

    start = actualEnd - overlap;
  }

  return chunks.filter((c) => c.content.length > 20);
}

/**
 * Full Ingestion Pipeline
 * Extracts pages, chunks them, generates vector embeddings, and persists in document_chunks
 */
export async function processDocumentIngestion(documentId, firmId, userId) {
  try {
    // Set status to processing
    await query(
      "UPDATE documents SET ingestion_status = 'processing' WHERE id = $1 AND firm_id = $2",
      [documentId, firmId],
      firmId
    );

    const docResult = await query(
      'SELECT id, case_id, firm_id, title, file_path FROM documents WHERE id = $1 AND firm_id = $2',
      [documentId, firmId],
      firmId
    );

    if (docResult.rows.length === 0) {
      throw new Error(`Document ${documentId} not found.`);
    }

    const doc = docResult.rows[0];
    const ext = path.extname(doc.file_path).toLowerCase();
    const mimeType = ext === '.pdf'
      ? 'application/pdf'
      : ext === '.docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'text/plain';

    // 1. Extract pages
    const pages = await extractPages(doc.file_path, mimeType);
    if (pages.length === 0) {
      throw new Error('No readable text content extracted from document.');
    }

    // 2. Chunk pages
    const allChunks = [];
    let globalChunkIdx = 0;

    for (const page of pages) {
      const pageChunks = chunkPage(page.text, page.pageNumber);
      for (const chunk of pageChunks) {
        allChunks.push({
          pageNumber: chunk.pageNumber,
          chunkIndex: globalChunkIdx++,
          content: chunk.content,
        });
      }
    }

    // 3. Clear existing chunks if re-ingesting
    await query('DELETE FROM document_chunks WHERE document_id = $1', [doc.id], firmId);

    // 4. Generate embeddings and store in document_chunks
    for (const chunk of allChunks) {
      const embeddingStr = await generateEmbedding(chunk.content);
      await query(
        `INSERT INTO document_chunks (document_id, case_id, firm_id, page_number, chunk_index, content, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [doc.id, doc.case_id, firmId, chunk.pageNumber, chunk.chunkIndex, chunk.content, embeddingStr],
        firmId
      );
    }

    // 5. Update document status to completed
    await query(
      "UPDATE documents SET ingestion_status = 'completed', page_count = $1 WHERE id = $2 AND firm_id = $3",
      [pages.length, doc.id, firmId],
      firmId
    );

    await logAudit({
      firmId,
      caseId: doc.case_id,
      userId,
      action: 'DOCUMENT_INGESTED',
      metadata: {
        documentId: doc.id,
        title: doc.title,
        pageCount: pages.length,
        chunkCount: allChunks.length,
      },
    });

    console.log(`[INGESTION SUCCESS] Document ${doc.title} (${doc.id}) ingested: ${pages.length} pages, ${allChunks.length} chunks.`);
    return { success: true, pageCount: pages.length, chunkCount: allChunks.length };
  } catch (err) {
    console.error(`[INGESTION FAILED] Document ${documentId}:`, err);
    await query(
      "UPDATE documents SET ingestion_status = 'failed' WHERE id = $1 AND firm_id = $2",
      [documentId, firmId],
      firmId
    );
    throw err;
  }
}
