// server/controllers/caseController.js
import { query } from '../config/db.js';
import { createCaseSchema } from '../validation/schemas.js';
import { logAudit } from '../services/auditService.js';

export async function listCases(req, res, next) {
  try {
    const result = await query(
      `SELECT c.*, u.full_name as created_by_name,
              COUNT(DISTINCT d.id)::int as document_count,
              COUNT(DISTINCT b.id)::int as brief_count
       FROM cases c
       LEFT JOIN users u ON u.id = c.created_by
       LEFT JOIN documents d ON d.case_id = c.id
       LEFT JOIN trial_briefs b ON b.case_id = c.id
       WHERE c.firm_id = $1
       GROUP BY c.id, u.full_name
       ORDER BY c.updated_at DESC`,
      [req.firmId],
      req.firmId
    );

    res.json({ cases: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function createCase(req, res, next) {
  try {
    const validated = createCaseSchema.parse(req.body);
    const { title, matterNumber } = validated;

    const result = await query(
      `INSERT INTO cases (firm_id, created_by, title, matter_number)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.firmId, req.user.id, title, matterNumber || null],
      req.firmId
    );

    const newCase = result.rows[0];

    await logAudit({
      firmId: req.firmId,
      caseId: newCase.id,
      userId: req.user.id,
      action: 'CASE_CREATED',
      metadata: { title: newCase.title, matterNumber: newCase.matter_number },
    });

    res.status(201).json({ case: newCase });
  } catch (err) {
    next(err);
  }
}

export async function getCaseById(req, res, next) {
  try {
    const result = await query(
      `SELECT c.*, u.full_name as created_by_name
       FROM cases c
       LEFT JOIN users u ON u.id = c.created_by
       WHERE c.id = $1 AND c.firm_id = $2`,
      [req.params.caseId, req.firmId],
      req.firmId
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    res.json({ case: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateCase(req, res, next) {
  try {
    const { title, matterNumber, status } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (matterNumber !== undefined) {
      updates.push(`matter_number = $${paramIndex++}`);
      values.push(matterNumber);
    }
    if (status !== undefined) {
      if (!['active', 'closed', 'archived'].includes(status)) {
        return res.status(400).json({ error: 'Status must be active, closed, or archived' });
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    updates.push(`updated_at = now()`);
    values.push(req.params.caseId, req.firmId);

    const sql = `
      UPDATE cases
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND firm_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, values, req.firmId);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const updatedCase = result.rows[0];

    await logAudit({
      firmId: req.firmId,
      caseId: updatedCase.id,
      userId: req.user.id,
      action: 'CASE_UPDATED',
      metadata: { title: updatedCase.title, status: updatedCase.status },
    });

    res.json({ case: updatedCase });
  } catch (err) {
    next(err);
  }
}

export async function deleteCase(req, res, next) {
  try {
    // 1. Check case existence and capture details
    const existing = await query(
      'SELECT id, title FROM cases WHERE id = $1 AND firm_id = $2',
      [req.params.caseId, req.firmId],
      req.firmId
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    const caseData = existing.rows[0];

    // 2. Record audit log BEFORE deleting the row to satisfy FK constraints
    await logAudit({
      firmId: req.firmId,
      caseId: caseData.id,
      userId: req.user.id,
      action: 'CASE_DELETED',
      metadata: { deletedCaseId: caseData.id, title: caseData.title },
    });

    // 3. Delete case (cascades or sets null per schema)
    await query(
      `DELETE FROM cases WHERE id = $1 AND firm_id = $2`,
      [req.params.caseId, req.firmId],
      req.firmId
    );

    res.json({ message: 'Case deleted successfully.', deletedId: req.params.caseId });
  } catch (err) {
    next(err);
  }
}
