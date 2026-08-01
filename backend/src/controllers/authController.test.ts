import request from 'supertest';
import express from 'express';
import { login } from './authController';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

// Mock env config
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

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock Prisma client
const mockFindUnique = jest.fn();
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    adminUser: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

// Mock password utility
const mockComparePassword = jest.fn();
jest.mock('../utils/password', () => ({
  __esModule: true,
  comparePassword: (...args: any[]) => mockComparePassword(...args),
}));

// Set up express app for testing
function createApp() {
  const app = express();
  app.use(express.json());
  app.post('/login', validate(loginSchema), login);
  return app;
}

function createAppWithRateLimiter() {
  const app = express();
  app.use(express.json());
  app.post('/login', authRateLimiter, validate(loginSchema), login);
  return app;
}

describe('Auth Controller - login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should return 400 when email is missing', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/login')
        .send({ password: 'somepassword' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when password is missing', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/login')
        .send({ email: 'admin@meetvia.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when email is invalid format', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/login')
        .send({ email: 'not-an-email', password: 'somepassword' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Authentication', () => {
    it('should return 401 with generic message when user not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const app = createApp();
      const res = await request(app)
        .post('/login')
        .send({ email: 'unknown@meetvia.com', password: 'somepassword' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        error: { message: 'Invalid email or password' },
      });
    });

    it('should return 401 with generic message when password does not match', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user123',
        email: 'admin@meetvia.com',
        password: '$2a$10$hashedpassword',
      });
      mockComparePassword.mockResolvedValue(false);

      const app = createApp();
      const res = await request(app)
        .post('/login')
        .send({ email: 'admin@meetvia.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        error: { message: 'Invalid email or password' },
      });
    });

    it('should return 200 with token and expiresAt on successful login', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user123',
        email: 'admin@meetvia.com',
        password: '$2a$10$hashedpassword',
      });
      mockComparePassword.mockResolvedValue(true);

      const app = createApp();
      const res = await request(app)
        .post('/login')
        .send({ email: 'admin@meetvia.com', password: 'ChangeMe123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('expiresAt');
      // Token should be a non-empty string
      expect(typeof res.body.data.token).toBe('string');
      expect(res.body.data.token.length).toBeGreaterThan(0);
      // expiresAt should be a valid ISO date string
      expect(new Date(res.body.data.expiresAt).toISOString()).toBe(res.body.data.expiresAt);
    });

    it('should not reveal whether email or password was wrong', async () => {
      // Test user not found
      mockFindUnique.mockResolvedValue(null);
      const app = createApp();
      const res1 = await request(app)
        .post('/login')
        .send({ email: 'nonexistent@meetvia.com', password: 'pass' });

      // Test wrong password
      mockFindUnique.mockResolvedValue({
        id: 'user123',
        email: 'admin@meetvia.com',
        password: '$2a$10$hashedpassword',
      });
      mockComparePassword.mockResolvedValue(false);
      const res2 = await request(app)
        .post('/login')
        .send({ email: 'admin@meetvia.com', password: 'wrongpass' });

      // Both should have identical error messages
      expect(res1.body.error.message).toBe(res2.body.error.message);
      expect(res1.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiter to the login route', async () => {
      mockFindUnique.mockResolvedValue(null);
      const app = createAppWithRateLimiter();

      // Send 6 requests (limit is 5)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/login')
          .send({ email: 'admin@meetvia.com', password: 'wrong' });
      }

      const res = await request(app)
        .post('/login')
        .send({ email: 'admin@meetvia.com', password: 'wrong' });

      expect(res.status).toBe(429);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('RATE_LIMITED');
    });
  });
});
