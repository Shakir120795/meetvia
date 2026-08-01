import { Router } from 'express';
import { getFooter } from '../../controllers/publicFooterController';

const router = Router();

// GET /api/v1/public/footer — footer description + visible social links
router.get('/', getFooter);

export default router;
