import { Router } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import { requestOtpSchema, verifyOtpSchema } from '../../validators/userAuth';
import { requestOtp, verifyOtp } from '../../controllers/userAuthController';

const router = Router();

router.post('/otp/request', authRateLimiter, validate(requestOtpSchema), requestOtp);
router.post('/otp/verify', authRateLimiter, validate(verifyOtpSchema), verifyOtp);

export default router;
