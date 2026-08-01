import { Router } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import { loginSchema } from '../../validators/auth';
import { login } from '../../controllers/authController';

const router = Router();

/**
 * POST /login
 * Authenticate admin user and return JWT token.
 * Rate limited to 5 attempts per 15 minutes per IP.
 */
router.post('/login', authRateLimiter, validate(loginSchema), login);

export default router;
