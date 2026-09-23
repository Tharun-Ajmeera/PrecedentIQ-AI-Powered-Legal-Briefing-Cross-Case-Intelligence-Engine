// server/routes/researchRoutes.js
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { submitResearchQuery, getQueryHistory } from '../controllers/researchController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceFirmScope } from '../middleware/firmScope.js';

const router = Router({ mergeParams: true });

const researchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 research queries per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for research queries. Please wait a moment.' },
});

router.use(authenticate);
router.use(enforceFirmScope);

router.post('/', researchLimiter, submitResearchQuery);
router.get('/', getQueryHistory);

export default router;
