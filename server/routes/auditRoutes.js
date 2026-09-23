// server/routes/auditRoutes.js
import { Router } from 'express';
import { getCaseAuditLogs, getFirmAuditLogs } from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceFirmScope } from '../middleware/firmScope.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(enforceFirmScope);
router.use(requireRole('attorney', 'compliance_officer'));

// Case-scoped audit route (when mounted under /api/cases/:caseId/audit)
router.get('/', (req, res, next) => {
  if (req.params.caseId) {
    return getCaseAuditLogs(req, res, next);
  }
  return getFirmAuditLogs(req, res, next);
});

export default router;
