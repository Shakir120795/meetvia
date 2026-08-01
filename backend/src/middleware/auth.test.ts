import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './auth';

// Mock the env config - needed by the jwt utility imported by auth middleware
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

// Mock dotenv to prevent it from trying to load .env file
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: statusMock,
    };
    mockNext = jest.fn();
  });

  it('should return 401 with NO_TOKEN when no authorization header is present', () => {
    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'No token provided',
        code: 'NO_TOKEN',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with NO_TOKEN when authorization header does not start with Bearer', () => {
    mockReq.headers = { authorization: 'Basic some-token' };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'No token provided',
        code: 'NO_TOKEN',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with NO_TOKEN when Bearer token is empty', () => {
    mockReq.headers = { authorization: 'Bearer ' };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'No token provided',
        code: 'NO_TOKEN',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with TOKEN_EXPIRED when token is expired', () => {
    const expiredToken = jwt.sign(
      { userId: 'user123', email: 'test@example.com' },
      'test-secret-key',
      { expiresIn: '-1s' }
    );
    mockReq.headers = { authorization: `Bearer ${expiredToken}` };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with INVALID_TOKEN when token is malformed', () => {
    mockReq.headers = { authorization: 'Bearer not-a-valid-jwt-token' };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with INVALID_TOKEN when token is signed with wrong secret', () => {
    const wrongSecretToken = jwt.sign(
      { userId: 'user123', email: 'test@example.com' },
      'wrong-secret-key',
      { expiresIn: '1h' }
    );
    mockReq.headers = { authorization: `Bearer ${wrongSecretToken}` };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should attach user payload to req.user and call next() on valid token', () => {
    const validToken = jwt.sign(
      { userId: 'user123', email: 'admin@meetvia.com' },
      'test-secret-key',
      { expiresIn: '1h' }
    );
    mockReq.headers = { authorization: `Bearer ${validToken}` };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({
      userId: 'user123',
      email: 'admin@meetvia.com',
    });
    expect(statusMock).not.toHaveBeenCalled();
  });
});
