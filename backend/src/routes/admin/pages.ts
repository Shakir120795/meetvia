import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateLegalPageSchema } from '../../validators/legalPage';
import { getLegalPage, updateLegalPage } from '../../controllers/adminPagesController';

const router = Router();

// All pages routes require authentication
router.use(authMiddleware);

// GET /:slug — get legal page by slug
router.get('/:slug', getLegalPage);

// PUT /:slug — update legal page content (validated, max 100K chars)
router.put('/:slug', validate(updateLegalPageSchema), updateLegalPage);

export default router;
