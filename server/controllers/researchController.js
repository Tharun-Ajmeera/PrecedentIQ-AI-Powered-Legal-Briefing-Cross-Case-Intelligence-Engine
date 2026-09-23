// server/controllers/researchController.js
import { query } from '../config/db.js';
import { researchQuerySchema } from '../validation/schemas.js';
import { executeRagQuery } from '../services/ragService.js';

export async function submitResearchQuery(req, res, next) {
  try {
    const validated = researchQuerySchema.parse(req.body);
    const { query: queryText, documentScope, mode } = validated;
    const { caseId } = req.params;

    const result = await executeRagQuery({
      caseId,
      firmId: req.firmId,
      userId: req.user.id,
      queryText,
      documentScope: documentScope || null,
      mode: mode || 'general_research',
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getQueryHistory(req, res, next) {
  try {
    const { caseId } = req.params;
    const result = await query(
      `SELECT q.*, u.full_name as asked_by_name
       FROM research_queries q
       LEFT JOIN users u ON u.id = q.asked_by
       WHERE q.case_id = $1 AND q.firm_id = $2
       ORDER BY q.created_at DESC`,
      [caseId, req.firmId],
      req.firmId
    );

    res.json({ queries: result.rows });
  } catch (err) {
    next(err);
  }
}
