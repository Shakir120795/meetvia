import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createTestimonialSchema, updateTestimonialSchema } from '../../validators/testimonial';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  toggleVerified,
  toggleVisibility,
  deleteTestimonial,
} from '../../controllers/adminTestimonialsController';

const router = Router();

// All routes require JWT authentication
router.use(authMiddleware);

/**
 * GET /
 * List all testimonials sorted by displayOrder.
 */
router.get('/', getAllTestimonials);

/**
 * POST /
 * Create a new testimonial.
 */
router.post('/', validate(createTestimonialSchema), createTestimonial);

/**
 * PUT /:id
 * Update a testimonial by ID.
 */
router.put('/:id', validate(updateTestimonialSchema), updateTestimonial);

/**
 * PATCH /:id/verify
 * Toggle isVerified for a testimonial. Body: { isVerified: boolean }
 */
router.patch('/:id/verify', toggleVerified);

/**
 * PATCH /:id/visibility
 * Toggle isVisible for a testimonial. Body: { isVisible: boolean }
 */
router.patch('/:id/visibility', toggleVisibility);

/**
 * DELETE /:id
 * Delete a testimonial by ID.
 */
router.delete('/:id', deleteTestimonial);

export default router;
