import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter for authentication endpoints.
 * Limits to 5 requests per 15-minute window per IP address.
 * Returns 429 with retry delay information when limit is exceeded.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: (_req: Request, res: Response) => {
    const retryAfterSeconds = res.getHeader('Retry-After');
    const retryMinutes = retryAfterSeconds
      ? Math.ceil(Number(retryAfterSeconds) / 60)
      : 15;

    return {
      success: false,
      error: {
        message: `Too many attempts. Try again in ${retryMinutes} minutes`,
        code: 'RATE_LIMITED',
      },
    };
  },
  statusCode: 429,
  keyGenerator: (req: Request): string => {
    // Use X-Forwarded-For if behind a proxy, otherwise use socket address
    return (req.ip || req.socket.remoteAddress || 'unknown') as string;
  },
});

export default authRateLimiter;
