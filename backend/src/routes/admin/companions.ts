import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { getCompanions, updateCompanion } from '../../controllers/adminCompanionsController';

const router = Router();

// All companion routes require authentication
router.use(authMiddleware);

// GET / — list all companion applications with optional ?status= filter
router.get('/', getCompanions);

// PUT /:id — update companion application status and admin notes
router.put('/:id', updateCompanion);

export default router;
