// server/controllers/clauseController.js
import { query } from '../config/db.js';
import { clauseComparisonSchema } from '../validation/schemas.js';
import { generateGrounded } from '../services/geminiClient.js';
import { verifyCitations } from '../services/citationVerifier.js';
import { logAudit } from '../services/auditService.js';
import { SYSTEM_PROMPT } from '../services/ragService.js';

export const CLAUSE_SCHEMA = {
  type: "object",
  properties: {
    subjectMatter: { type: "string" },
    rows: {
      type: "array",
      items: {
        type: "object",
        properties: {
          documentTitle: { type: "string" },
          pageNumber: { type: "integer" },
          clauseText: { type: "string" },
          divergenceNote: { type: "string" },
        },
        required: ["documentTitle", "pageNumber", "clauseText", "divergenceNote"],
      },
    },
  },
  required: ["subjectMatter", "rows"],
};

export async function generateClauseComparison(req, res, next) {
  try {
    const validated = clauseComparisonSchema.parse(req.body);
    const { documentIds, subjectMatter } = validated;
    const { caseId } = req.params;

    // Fetch chunks from the selected contract documents
    const chunksRes = await query(
      `SELECT c.id, c.document_id, c.page_number, c.content, d.title as document_title
       FROM document_chunks c
       JOIN documents d ON d.id = c.document_id
       WHERE c.case_id = $1 AND c.firm_id = $2 AND c.document_id = ANY($3)
       ORDER BY d.id, c.page_number ASC
       LIMIT 30`,
      [caseId, req.firmId, documentIds],
      req.firmId
    );

    const chunks = chunksRes.rows;
    if (chunks.length === 0) {
      return res.status(400).json({
        error: 'No indexed document content found for the selected contracts.',
      });
    }

    const contextStr = chunks
      .map((c) => `--- [${c.document_title}, Page ${c.page_number}]\n${c.content}`)
      .join('\n\n');

    const userPrompt = `SUBJECT MATTER TO COMPARE:
${subjectMatter}

CONTRACT CLAUSES & DOCUMENTS:
${contextStr}

INSTRUCTIONS:
Extract and compare all clauses addressing the subject matter "${subjectMatter}" across the uploaded agreements.
For each document:
- Extract the verbatim or close excerpt of the relevant clause
- State the exact documentTitle and pageNumber
- Provide a clear divergenceNote explaining differences in legal liability, indemnity limits, termination rights, or obligations compared to standard provisions or the other agreements.
Strictly adhere to the JSON schema.`;

    const rawResponse = await generateGrounded({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      jsonSchema: CLAUSE_SCHEMA,
    });

    const verifiedResponse = verifyCitations(rawResponse, chunks);

    const comparisonRes = await query(
      `INSERT INTO clause_comparisons (case_id, firm_id, generated_by, document_ids, subject_matter, matrix)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [caseId, req.firmId, req.user.id, documentIds, subjectMatter, JSON.stringify(verifiedResponse)],
      req.firmId
    );

    const comparison = comparisonRes.rows[0];

    await logAudit({
      firmId: req.firmId,
      caseId,
      userId: req.user.id,
      action: 'CLAUSE_COMPARISON_GENERATED',
      metadata: {
        comparisonId: comparison.id,
        subjectMatter,
        documentIdsCount: documentIds.length,
        rowsCount: verifiedResponse.rows?.length || 0,
      },
    });

    res.status(201).json({ comparison });
  } catch (err) {
    next(err);
  }
}

export async function getClauseComparison(req, res, next) {
  try {
    const { caseId, matrixId } = req.params;
    const result = await query(
      `SELECT c.*, u.full_name as generated_by_name
       FROM clause_comparisons c
       LEFT JOIN users u ON u.id = c.generated_by
       WHERE c.id = $1 AND c.case_id = $2 AND c.firm_id = $3`,
      [matrixId, caseId, req.firmId],
      req.firmId
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clause comparison matrix not found.' });
    }

    res.json({ comparison: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function listClauseComparisons(req, res, next) {
  try {
    const { caseId } = req.params;
    const result = await query(
      `SELECT c.*, u.full_name as generated_by_name
       FROM clause_comparisons c
       LEFT JOIN users u ON u.id = c.generated_by
       WHERE c.case_id = $1 AND c.firm_id = $2
       ORDER BY c.created_at DESC`,
      [caseId, req.firmId],
      req.firmId
    );

    res.json({ comparisons: result.rows });
  } catch (err) {
    next(err);
  }
}
