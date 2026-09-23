// server/routes/documentRoutes.js
import { Router } from 'express';
import {
  uploadDocument,
  uploadMiddleware,
  listDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceFirmScope } from '../middleware/firmScope.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(enforceFirmScope);

router.post('/', uploadMiddleware.single('file'), uploadDocument);
router.get('/', listDocuments);
router.get('/:docId', getDocumentById);
router.patch('/:docId', updateDocument);
router.get('/:docId/download', downloadDocument);
router.delete('/:docId', requireRole('attorney'), deleteDocument);

export default router;
