import { Router } from 'express';
import { getAllFaq, getFaqPreview } from '../../controllers/publicFaqController';

const router = Router();

// GET /api/v1/public/faq — all FAQs sorted by displayOrder
router.get('/', getAllFaq);

// GET /api/v1/public/faq/preview — first 6 FAQs
router.get('/preview', getFaqPreview);

export default router;
