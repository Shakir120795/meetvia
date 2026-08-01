import { Router } from 'express';
import { getServices, getFeaturedServices } from '../../controllers/publicServicesController';

const router = Router();

// GET /api/v1/public/services — all visible services sorted by displayOrder
router.get('/', getServices);

// GET /api/v1/public/services/featured — featured services (max 6, fill with visible if fewer)
router.get('/featured', getFeaturedServices);

export default router;
