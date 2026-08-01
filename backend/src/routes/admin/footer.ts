import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { getFooter, updateFooter } from '../../controllers/adminFooterController';

const router = Router();

// All footer routes require authentication
router.use(authMiddleware);

// GET / — get footer settings (description from SiteSettings)
router.get('/', getFooter);

// PUT / — update footer description
router.put('/', updateFooter);

export default router;
