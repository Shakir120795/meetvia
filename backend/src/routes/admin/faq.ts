import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createFaqSchema, updateFaqSchema } from '../../validators/faq';
import {
  getAllFaqs,
  createFaq,
  updateFaq,
  reorderFaqs,
  deleteFaq,
} from '../../controllers/adminFaqController';

const router = Router();

// All routes require JWT authentication
router.use(authMiddleware);

/**
 * GET /
 * List all FAQs sorted by displayOrder.
 */
router.get('/', getAllFaqs);

/**
 * POST /
 * Create a new FAQ. Rejects empty question/answer.
 */
router.post('/', validate(createFaqSchema), createFaq);

/**
 * PUT /reorder
 * Bulk reorder FAQs. Body: { items: [{ id, displayOrder }] }
 * Must be placed before /:id to avoid route conflict.
 */
router.put('/reorder', reorderFaqs);

/**
 * PUT /:id
 * Update a FAQ by ID.
 */
router.put('/:id', validate(updateFaqSchema), updateFaq);

/**
 * DELETE /:id
 * Delete a FAQ by ID.
 */
router.delete('/:id', deleteFaq);

export default router;
