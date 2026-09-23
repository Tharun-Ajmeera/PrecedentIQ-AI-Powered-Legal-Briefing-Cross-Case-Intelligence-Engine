// server/routes/clauseRoutes.js
import { Router } from 'express';
import {
  generateClauseComparison,
  getClauseComparison,
  listClauseComparisons,
} from '../controllers/clauseController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceFirmScope } from '../middleware/firmScope.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(enforceFirmScope);

router.post('/', generateClauseComparison);
router.get('/', listClauseComparisons);
router.get('/:matrixId', getClauseComparison);

export default router;
