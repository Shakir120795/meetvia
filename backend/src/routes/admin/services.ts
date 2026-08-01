import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createServiceSchema, updateServiceSchema } from '../../validators/service';
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from '../../controllers/adminServicesController';

const router = Router();

// All routes require JWT authentication
router.use(authMiddleware);

/**
 * GET /
 * List all services (including hidden), sorted by displayOrder.
 */
router.get('/', getAllServices);

/**
 * POST /
 * Create a new service.
 */
router.post('/', validate(createServiceSchema), createService);

/**
 * PUT /:id
 * Update a service by ID.
 */
router.put('/:id', validate(updateServiceSchema), updateService);

/**
 * DELETE /:id
 * Delete a service by ID.
 */
router.delete('/:id', deleteService);

export default router;
