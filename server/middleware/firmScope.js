// server/middleware/firmScope.js
import { query } from '../config/db.js';

/**
 * Ensures req.firmId is extracted securely from the verified JWT.
 * Optionally verifies that the caseId in route params belongs to the caller's firm.
 */
export async function enforceFirmScope(req, res, next) {
  if (!req.user || !req.user.firm_id) {
    return res.status(401).json({ error: 'Tenant context missing from session.' });
  }

  req.firmId = req.user.firm_id;

  // If a caseId parameter is present in the route, verify ownership
  if (req.params.caseId) {
    try {
      const caseResult = await query(
        'SELECT id, firm_id, title FROM cases WHERE id = $1',
        [req.params.caseId],
        req.firmId
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({ error: 'Case not found or access denied.' });
      }

      const caseData = caseResult.rows[0];
      if (caseData.firm_id !== req.firmId) {
        return res.status(403).json({ error: 'Cross-firm access forbidden.' });
      }

      req.currentCase = caseData;
    } catch (err) {
      return next(err);
    }
  }

  next();
}
