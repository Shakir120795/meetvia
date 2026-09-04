import { Router } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import { companionRegisterSchema, companionLoginSchema } from '../../validators/auth';
import { authMiddleware } from '../../middleware/auth';
import { requireUserType } from '../../middleware/rbac';
import { 
  register,
  login, 
  getProfile, 
  updateProfile 
} from '../../controllers/companionAuthController';

const router = Router();

// Public routes (no auth required)
router.post('/register', authRateLimiter, validate(companionRegisterSchema), register);
router.post('/login', authRateLimiter, validate(companionLoginSchema), login);

// Protected routes (require COMPANION auth)
router.get('/profile', authMiddleware, requireUserType('COMPANION'), getProfile);
router.put('/profile', authMiddleware, requireUserType('COMPANION'), updateProfile);

export default router;