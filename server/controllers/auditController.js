// server/controllers/auditController.js
import { query } from '../config/db.js';

export async function getCaseAuditLogs(req, res, next) {
  try {
    const { caseId } = req.params;
    const { action } = req.query;

    let sql = `
      SELECT a.*, u.full_name as user_name, u.email as user_email, u.role as user_role,
             c.title as case_title
      FROM audit_logs a
      JOIN users u ON u.id = a.user_id
      LEFT JOIN cases c ON c.id = a.case_id
      WHERE a.firm_id = $1 AND a.case_id = $2
    `;
    const params = [req.firmId, caseId];

    if (action) {
      sql += ` AND a.action = $3`;
      params.push(action);
    }

    sql += ` ORDER BY a.created_at DESC LIMIT 100`;

    const result = await query(sql, params, req.firmId);
    res.json({ logs: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getFirmAuditLogs(req, res, next) {
  try {
    const { action, caseId } = req.query;

    let sql = `
      SELECT a.*, u.full_name as user_name, u.email as user_email, u.role as user_role,
             c.title as case_title
      FROM audit_logs a
      JOIN users u ON u.id = a.user_id
      LEFT JOIN cases c ON c.id = a.case_id
      WHERE a.firm_id = $1
    `;
    const params = [req.firmId];

    if (caseId) {
      params.push(caseId);
      sql += ` AND a.case_id = $${params.length}`;
    }
    if (action) {
      params.push(action);
      sql += ` AND a.action = $${params.length}`;
    }

    sql += ` ORDER BY a.created_at DESC LIMIT 200`;

    const result = await query(sql, params, req.firmId);
    res.json({ logs: result.rows });
  } catch (err) {
    next(err);
  }
}
