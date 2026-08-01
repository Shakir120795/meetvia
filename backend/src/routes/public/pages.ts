import { Router } from 'express';
import { getPageBySlug } from '../../controllers/publicPagesController';

const router = Router();

// GET /api/v1/public/pages/:slug — legal page by slug
router.get('/:slug', getPageBySlug);

export default router;
