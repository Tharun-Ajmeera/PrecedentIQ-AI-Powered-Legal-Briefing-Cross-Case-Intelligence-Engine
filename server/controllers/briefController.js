// server/controllers/briefController.js
import { query } from '../config/db.js';
import { briefGenerateSchema, briefUpdateSchema } from '../validation/schemas.js';
import { generateGrounded } from '../services/geminiClient.js';
import { verifyCitations } from '../services/citationVerifier.js';
import { logAudit } from '../services/auditService.js';
import { SYSTEM_PROMPT } from '../services/ragService.js';

export const BRIEF_SCHEMA = {
  type: "object",
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issueStatement: { type: "string" },
          applicableRule: { type: "string" },
          ruleCitations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                documentTitle: { type: "string" },
                pageNumber: { type: "integer" },
              },
              required: ["documentTitle", "pageNumber"],
            },
          },
          analysis: { type: "string" },
          conclusion: { type: "string" },
        },
        required: [
          "issueStatement",
          "applicableRule",
          "ruleCitations",
          "analysis",
          "conclusion",
        ],
      },
    },
  },
  required: ["sections"],
};

export async function generateBrief(req, res, next) {
  try {
    const validated = briefGenerateSchema.parse(req.body);
    const { title, issueStatements, includeDocumentIds } = validated;
    const { caseId } = req.params;

    // Fetch relevant chunks for the included documents
    const chunksRes = await query(
      `SELECT c.id, c.document_id, c.page_number, c.content, d.title as document_title
       FROM document_chunks c
       JOIN documents d ON d.id = c.document_id
       WHERE c.case_id = $1 AND c.firm_id = $2 AND c.document_id = ANY($3)
       ORDER BY c.page_number ASC
       LIMIT 25`,
      [caseId, req.firmId, includeDocumentIds],
      req.firmId
    );

    const chunks = chunksRes.rows;
    if (chunks.length === 0) {
      return res.status(400).json({
        error: 'No indexed document chunks found for the selected document IDs.',
      });
    }

    const contextStr = chunks
      .map((c) => `--- [${c.document_title}, Page ${c.page_number}]\n${c.content}`)
      .join('\n\n');

    const issuesStr = issueStatements.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n');

    const userPrompt = `CASE CONTEXT (grounding materials):
${contextStr}

ISSUES TO BRIEF:
${issuesStr}

INSTRUCTIONS:
Synthesize a court-ready trial brief outline using the strict IRAC methodology:
- Issue Statement: Clearly frame the legal question.
- Applicable Rule: Articulate the governing legal principle or contractual clause directly quoting or closely paraphrasing the context, followed by exact citations [Document Title, Page N].
- Rule Citations: Array of { documentTitle, pageNumber } for every cited authority.
- Analysis: Apply the rule strictly to the record facts in the context.
- Conclusion: State the supported legal holding or finding.

Every single section MUST have at least one valid citation in ruleCitations. Do not include outside knowledge.`;

    const rawResponse = await generateGrounded({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      jsonSchema: BRIEF_SCHEMA,
    });

    const verifiedResponse = verifyCitations(rawResponse, chunks);

    const briefRes = await query(
      `INSERT INTO trial_briefs (case_id, firm_id, created_by, title, content, version, status)
       VALUES ($1, $2, $3, $4, $5, 1, 'draft')
       RETURNING *`,
      [caseId, req.firmId, req.user.id, title, JSON.stringify(verifiedResponse)],
      req.firmId
    );

    const brief = briefRes.rows[0];

    await logAudit({
      firmId: req.firmId,
      caseId,
      userId: req.user.id,
      action: 'BRIEF_SYNTHESIZED',
      metadata: {
        briefId: brief.id,
        title: brief.title,
        sectionsCount: verifiedResponse.sections?.length || 0,
      },
    });

    res.status(201).json({ brief });
  } catch (err) {
    next(err);
  }
}

export async function listBriefs(req, res, next) {
  try {
    const { caseId } = req.params;
    const result = await query(
      `SELECT b.*, u.full_name as created_by_name
       FROM trial_briefs b
       LEFT JOIN users u ON u.id = b.created_by
       WHERE b.case_id = $1 AND b.firm_id = $2
       ORDER BY b.updated_at DESC`,
      [caseId, req.firmId],
      req.firmId
    );

    res.json({ briefs: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getBriefById(req, res, next) {
  try {
    const { caseId, briefId } = req.params;
    const result = await query(
      `SELECT b.*, u.full_name as created_by_name
       FROM trial_briefs b
       LEFT JOIN users u ON u.id = b.created_by
       WHERE b.id = $1 AND b.case_id = $2 AND b.firm_id = $3`,
      [briefId, caseId, req.firmId],
      req.firmId
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trial brief not found.' });
    }

    res.json({ brief: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateBrief(req, res, next) {
  try {
    const validated = briefUpdateSchema.parse(req.body);
    const { content, status } = validated;
    const { caseId, briefId } = req.params;

    const existingRes = await query(
      'SELECT id, version, status FROM trial_briefs WHERE id = $1 AND case_id = $2 AND firm_id = $3',
      [briefId, caseId, req.firmId],
      req.firmId
    );

    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Trial brief not found.' });
    }

    const currentBrief = existingRes.rows[0];
    const newVersion = currentBrief.version + 1;
    const newStatus = status || currentBrief.status;

    const updateRes = await query(
      `UPDATE trial_briefs
       SET content = $1, version = $2, status = $3, updated_at = now()
       WHERE id = $4 AND firm_id = $5
       RETURNING *`,
      [JSON.stringify(content), newVersion, newStatus, briefId, req.firmId],
      req.firmId
    );

    const updatedBrief = updateRes.rows[0];

    await logAudit({
      firmId: req.firmId,
      caseId,
      userId: req.user.id,
      action: 'BRIEF_UPDATED',
      metadata: { briefId, version: newVersion, status: newStatus },
    });

    res.json({ brief: updatedBrief });
  } catch (err) {
    next(err);
  }
}

export async function finalizeBrief(req, res, next) {
  try {
    const { caseId, briefId } = req.params;

    const result = await query(
      `UPDATE trial_briefs
       SET status = 'finalized', updated_at = now()
       WHERE id = $1 AND case_id = $2 AND firm_id = $3
       RETURNING *`,
      [briefId, caseId, req.firmId],
      req.firmId
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trial brief not found.' });
    }

    const finalizedBrief = result.rows[0];

    await logAudit({
      firmId: req.firmId,
      caseId,
      userId: req.user.id,
      action: 'BRIEF_FINALIZED',
      metadata: { briefId, version: finalizedBrief.version },
    });

    res.json({
      message: 'Trial brief successfully finalized and locked for court filing.',
      brief: finalizedBrief,
    });
  } catch (err) {
    next(err);
  }
}
