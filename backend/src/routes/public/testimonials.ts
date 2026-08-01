import { Router } from 'express';
import { getTestimonials, getTestimonialsPreview } from '../../controllers/publicTestimonialsController';

const router = Router();

// GET /api/v1/public/testimonials — verified + visible testimonials sorted by displayOrder
router.get('/', getTestimonials);

// GET /api/v1/public/testimonials/preview — max 3 verified + visible testimonials
router.get('/preview', getTestimonialsPreview);

export default router;
