import { Router } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import { sendOtpSchema, verifyOtpSchema } from '../../validators/auth';
import { authMiddleware } from '../../middleware/auth';
import { requireUserType } from '../../middleware/rbac';
import { 
  sendEmailOtp, 
  verifyEmailOtp, 
  getProfile, 
  updateProfile 
} from '../../controllers/userAuthController';

const router = Router();

// Public routes (no auth required)
router.post('/send-otp', authRateLimiter, validate(sendOtpSchema), sendEmailOtp);
router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), verifyEmailOtp);

// Protected routes (require USER auth)
router.get('/profile', authMiddleware, requireUserType('USER'), getProfile);
router.put('/profile', authMiddleware, requireUserType('USER'), updateProfile);

export default router;