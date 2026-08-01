import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error with HTTP status code and optional field/code metadata.
 */
export class AppError extends Error {
  public statusCode: number;
  public field?: string;
  public code?: string;

  constructor(message: string, statusCode: number, field?: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.field = field;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Structured error response format returned by the API.
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    field?: string;
    code?: string;
  };
}

/**
 * Centralized error handler middleware.
 * Catches all errors and returns a structured JSON response with the appropriate HTTP status code.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default to 500 Internal Server Error
  let statusCode = 500;
  let message = 'Internal server error';
  let field: string | undefined;
  let code: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    field = err.field;
    code = err.code;
  } else if (err.name === 'ValidationError') {
    // Validation error
    statusCode = 400;
    message = err.message;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    // Invalid identifier format
    statusCode = 400;
    message = 'Invalid resource identifier';
    code = 'INVALID_ID';
  } else if ((err as any).code === 'P2002') {
    // Prisma unique constraint violation
    statusCode = 409;
    const target = (err as any).meta?.target;
    const duplicateField = Array.isArray(target) ? target[0] : target;
    message = duplicateField
      ? `Duplicate value for field: ${duplicateField}`
      : 'Duplicate entry';
    field = duplicateField;
    code = 'DUPLICATE_ENTRY';
  } else if ((err as any).code === 'P2025') {
    // Prisma record not found
    statusCode = 404;
    message = 'Record not found';
    code = 'NOT_FOUND';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if ((err as any).type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request entity too large';
    code = 'PAYLOAD_TOO_LARGE';
  }

  // Handle Multer file upload errors
  if (err.message === 'FILE_SIZE_EXCEEDED') {
    statusCode = 413;
    message = 'File size exceeded';
    code = 'FILE_SIZE_EXCEEDED';
  } else if (err.message === 'UNSUPPORTED_FILE_TYPE') {
    statusCode = 415;
    message = 'Unsupported file type';
    code = 'UNSUPPORTED_FILE_TYPE';
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      message,
      ...(field && { field }),
      ...(code && { code }),
    },
  };

  res.status(statusCode).json(response);
}

export default errorHandler;
