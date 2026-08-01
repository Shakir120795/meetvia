import jwt from 'jsonwebtoken';
import { signToken, verifyToken, TokenPayload } from './jwt';

// Mock env module to provide test values
jest.mock('../config/env', () => ({
  __esModule: true,
  default: {
    JWT_SECRET: 'test-secret-key-for-testing',
    JWT_EXPIRY: '1h',
    DATABASE_URL: 'postgresql://localhost:5432/test',
    PORT: 5000,
    NODE_ENV: 'test',
  },
}));

describe('JWT utilities', () => {
  const testPayload: TokenPayload = {
    userId: '507f1f77bcf86cd799439011',
    email: 'admin@meetvia.com',
  };

  describe('signToken', () => {
    it('should sign a token with the given payload', () => {
      const token = signToken(testPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include userId and email in the token payload', () => {
      const token = signToken(testPayload);
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should set default expiry from env config', () => {
      const token = signToken(testPayload);
      const decoded = jwt.decode(token) as any;
      expect(decoded.exp).toBeDefined();
      // Default is 1h, so exp should be about 3600s from iat
      expect(decoded.exp - decoded.iat).toBe(3600);
    });

    it('should allow custom expiry override', () => {
      const token = signToken(testPayload, '2h');
      const decoded = jwt.decode(token) as any;
      expect(decoded.exp - decoded.iat).toBe(7200);
    });
  });

  describe('verifyToken', () => {
    it('should verify and return the decoded payload for a valid token', () => {
      const token = signToken(testPayload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should throw JsonWebTokenError for malformed tokens', () => {
      expect(() => verifyToken('not-a-valid-token')).toThrow();
      try {
        verifyToken('not-a-valid-token');
      } catch (err: any) {
        expect(err.name).toBe('JsonWebTokenError');
      }
    });

    it('should throw JsonWebTokenError for tokens signed with wrong secret', () => {
      const wrongToken = jwt.sign(testPayload, 'wrong-secret', { expiresIn: '1h' });
      expect(() => verifyToken(wrongToken)).toThrow();
      try {
        verifyToken(wrongToken);
      } catch (err: any) {
        expect(err.name).toBe('JsonWebTokenError');
      }
    });

    it('should throw TokenExpiredError for expired tokens', () => {
      const expiredToken = jwt.sign(testPayload, 'test-secret-key-for-testing', { expiresIn: '0s' });
      expect(() => verifyToken(expiredToken)).toThrow();
      try {
        verifyToken(expiredToken);
      } catch (err: any) {
        expect(err.name).toBe('TokenExpiredError');
      }
    });
  });
});
