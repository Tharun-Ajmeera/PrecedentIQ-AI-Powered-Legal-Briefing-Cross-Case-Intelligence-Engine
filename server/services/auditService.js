// server/services/auditService.js
import { query } from '../config/db.js';

/**
 * Record an immutable audit log entry
 * @param {Object} params
 * @param {string} params.firmId
 * @param {string|null} params.caseId
 * @param {string} params.userId
 * @param {string} params.action - e.g. 'DOCUMENT_UPLOAD', 'RAG_QUERY', 'BRIEF_FINALIZED'
 * @param {Object} [params.metadata={}]
 */
export async function logAudit({ firmId, caseId = null, userId, action, metadata = {} }) {
  try {
    const text = `
      INSERT INTO audit_logs (firm_id, case_id, user_id, action, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;
    const params = [firmId, caseId, userId, action, JSON.stringify(metadata)];
    const result = await query(text, params, firmId);
    return result.rows[0];
  } catch (err) {
    console.error('[AUDIT LOG ERROR] Failed to record audit entry:', err.message);
    // Audit logging should not crash the request, but must be logged to stderr
    return null;
  }
}
