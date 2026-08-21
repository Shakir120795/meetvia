import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { getUsers, updateUserStatus } from '../../controllers/adminUsersController';

const router = Router();
router.use(authMiddleware);
router.get('/', getUsers);
router.patch('/:id/status', updateUserStatus);
export default router;
