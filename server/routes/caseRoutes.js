// server/routes/caseRoutes.js
import { Router } from 'express';
import {
  listCases,
  createCase,
  getCaseById,
  updateCase,
  deleteCase,
} from '../controllers/caseController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceFirmScope } from '../middleware/firmScope.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(enforceFirmScope);

router.get('/', listCases);
router.post('/', createCase);
router.get('/:caseId', getCaseById);
router.patch('/:caseId', updateCase);
router.delete('/:caseId', requireRole('attorney'), deleteCase);

export default router;
