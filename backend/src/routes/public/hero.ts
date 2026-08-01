import { Router } from 'express';
import { getHeroSlides } from '../../controllers/publicHeroController';

const router = Router();

// GET /api/v1/public/hero-slides
router.get('/', getHeroSlides);

export default router;
