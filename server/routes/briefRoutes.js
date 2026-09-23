// server/routes/briefRoutes.js
import { Router } from 'express';
import {
  generateBrief,
  listBriefs,
  getBriefById,
  updateBrief,
  finalizeBrief,
} from '../controllers/briefController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceFirmScope } from '../middleware/firmScope.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(enforceFirmScope);

router.post('/', generateBrief);
router.get('/', listBriefs);
router.get('/:briefId', getBriefById);
router.patch('/:briefId', updateBrief);
router.post('/:briefId/finalize', requireRole('attorney'), finalizeBrief);

export default router;
