import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from './errorHandler';

// Helper to create mock Express objects
function createMocks() {
  const req = {} as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('errorHandler middleware', () => {
  it('should return 500 for generic errors', () => {
    const { req, res, next } = createMocks();
    const err = new Error('Something went wrong');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Internal server error' },
    });
  });

  it('should return correct status and message for AppError', () => {
    const { req, res, next } = createMocks();
    const err = new AppError('Resource not found', 404, undefined, 'NOT_FOUND');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Resource not found', code: 'NOT_FOUND' },
    });
  });

  it('should include field when provided in AppError', () => {
    const { req, res, next } = createMocks();
    const err = new AppError('Invalid email format', 400, 'email', 'VALIDATION_ERROR');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Invalid email format', field: 'email', code: 'VALIDATION_ERROR' },
    });
  });

  it('should handle ValidationError (400)', () => {
    const { req, res, next } = createMocks();
    const err = new Error('Path `title` is required');
    err.name = 'ValidationError';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Path `title` is required', code: 'VALIDATION_ERROR' },
    });
  });

  it('should handle CastError / invalid identifier (400)', () => {
    const { req, res, next } = createMocks();
    const err = new Error('Invalid id format');
    err.name = 'CastError';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Invalid resource identifier', code: 'INVALID_ID' },
    });
  });

  it('should handle Prisma unique constraint violation P2002 (409)', () => {
    const { req, res, next } = createMocks();
    const err: any = new Error('Unique constraint failed');
    err.code = 'P2002';
    err.meta = { target: ['email'] };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Duplicate value for field: email',
        field: 'email',
        code: 'DUPLICATE_ENTRY',
      },
    });
  });

  it('should handle Prisma record not found P2025 (404)', () => {
    const { req, res, next } = createMocks();
    const err: any = new Error('Record not found');
    err.code = 'P2025';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Record not found', code: 'NOT_FOUND' },
    });
  });

  it('should handle JsonWebTokenError (401)', () => {
    const { req, res, next } = createMocks();
    const err = new Error('jwt malformed');
    err.name = 'JsonWebTokenError';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Invalid token', code: 'INVALID_TOKEN' },
    });
  });

  it('should handle TokenExpiredError (401)', () => {
    const { req, res, next } = createMocks();
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Token expired', code: 'TOKEN_EXPIRED' },
    });
  });

  it('should handle file size exceeded (413)', () => {
    const { req, res, next } = createMocks();
    const err = new Error('FILE_SIZE_EXCEEDED');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'File size exceeded', code: 'FILE_SIZE_EXCEEDED' },
    });
  });

  it('should handle unsupported file type (415)', () => {
    const { req, res, next } = createMocks();
    const err = new Error('UNSUPPORTED_FILE_TYPE');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Unsupported file type', code: 'UNSUPPORTED_FILE_TYPE' },
    });
  });

  it('should handle entity too large (413)', () => {
    const { req, res, next } = createMocks();
    const err: any = new Error('request entity too large');
    err.type = 'entity.too.large';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Request entity too large', code: 'PAYLOAD_TOO_LARGE' },
    });
  });

  it('should handle AppError with 429 status (rate limit)', () => {
    const { req, res, next } = createMocks();
    const err = new AppError('Too many requests, please try again later', 429, undefined, 'RATE_LIMIT_EXCEEDED');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
    });
  });
});
