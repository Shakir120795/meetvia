import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createHeroSlideSchema, updateHeroSlideSchema } from '../../validators/heroSlide';
import {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  reorderHeroSlides,
  toggleHeroSlideVisibility,
  deleteHeroSlide,
} from '../../controllers/adminHeroController';

const router = Router();

// All hero routes require authentication
router.use(authMiddleware);

// GET / — list all slides (including hidden ones, sorted by displayOrder)
router.get('/', getHeroSlides);

// POST / — create new slide
router.post('/', validate(createHeroSlideSchema), createHeroSlide);

// PUT /reorder — bulk reorder slides (must be before /:id to avoid conflict)
router.put('/reorder', reorderHeroSlides);

// PUT /:id — update slide
router.put('/:id', validate(updateHeroSlideSchema), updateHeroSlide);

// PATCH /:id/visibility — toggle visibility
router.patch('/:id/visibility', toggleHeroSlideVisibility);

// DELETE /:id — delete slide
router.delete('/:id', deleteHeroSlide);

export default router;
