import express from 'express';
import request from 'supertest';
import rateLimit from 'express-rate-limit';

// Mock the env config
jest.mock('../config/env', () => ({
  __esModule: true,
  default: {
    JWT_SECRET: 'test-secret-key',
    JWT_EXPIRY: '24h',
    DATABASE_URL: 'postgresql://localhost:5432/test',
    PORT: 5000,
    NODE_ENV: 'test',
  },
}));

/**
 * Creates a fresh rate limiter instance with the same config as authRateLimiter
 * to avoid shared state between tests.
 */
function createTestRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: (_req: express.Request, res: express.Response) => {
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
    keyGenerator: (req: express.Request): string => {
      return (req.ip || req.socket.remoteAddress || 'unknown') as string;
    },
  });
}

function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use('/api/v1/admin/auth/login', createTestRateLimiter(), (_req, res) => {
    res.json({ success: true, message: 'Login endpoint' });
  });
  return app;
}

describe('Rate Limiter Middleware', () => {
  it('should allow requests within the rate limit', async () => {
    const app = createApp();
    const response = await request(app).post('/api/v1/admin/auth/login');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should return 429 after exceeding 5 requests in 15-minute window', async () => {
    const app = createApp();

    // Make 5 allowed requests
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/v1/admin/auth/login');
      expect(res.status).toBe(200);
    }

    // 6th request should be rate limited
    const response = await request(app).post('/api/v1/admin/auth/login');

    expect(response.status).toBe(429);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('RATE_LIMITED');
    expect(response.body.error.message).toMatch(/Too many attempts\. Try again in \d+ minutes/);
  });

  it('should include rate limit headers in responses', async () => {
    const app = createApp();
    const response = await request(app).post('/api/v1/admin/auth/login');

    expect(response.status).toBe(200);
    // Standard rate limit headers
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(response.headers['ratelimit-remaining']).toBeDefined();
  });
});

describe('authRateLimiter export', () => {
  it('should export the authRateLimiter middleware function', () => {
    // Import after mocks are set up
    const { authRateLimiter } = require('./rateLimiter');
    expect(authRateLimiter).toBeDefined();
    expect(typeof authRateLimiter).toBe('function');
  });
});
