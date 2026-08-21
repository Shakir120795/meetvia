import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { getUsers, updateUserStatus } from '../../controllers/adminUsersController';

const router = Router();
router.use(authMiddleware, requireRole('ADMIN'));
router.get('/', getUsers);
router.patch('/:id/status', updateUserStatus);
export default router;
