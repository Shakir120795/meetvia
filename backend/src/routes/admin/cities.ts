import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createCitySchema, updateCitySchema } from '../../validators/city';
import {
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
} from '../../controllers/adminCitiesController';

const router = Router();

// All routes require JWT authentication
router.use(authMiddleware);

/**
 * GET /
 * List all cities sorted by displayOrder.
 */
router.get('/', getAllCities);

/**
 * POST /
 * Create a new city. Returns 409 on duplicate {cityName, state}.
 */
router.post('/', validate(createCitySchema), createCity);

/**
 * PUT /:id
 * Update a city by ID.
 */
router.put('/:id', validate(updateCitySchema), updateCity);

/**
 * DELETE /:id
 * Delete a city by ID.
 */
router.delete('/:id', deleteCity);

export default router;
