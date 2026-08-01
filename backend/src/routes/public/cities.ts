import { Router } from 'express';
import { getCities } from '../../controllers/publicCitiesController';

const router = Router();

// GET /api/v1/public/cities — active cities sorted by displayOrder
router.get('/', getCities);

export default router;
