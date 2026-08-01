import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { getDashboardStats } from '../../controllers/dashboardController';

const router = Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// GET /stats — aggregate dashboard statistics
router.get('/stats', getDashboardStats);

export default router;
