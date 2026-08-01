import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

/**
 * Extend Express Request to include user payload from verified JWT.
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * JWT authentication middleware.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches the decoded user payload to req.user.
 *
 * Returns 401 with specific error codes:
 * - NO_TOKEN: No Authorization header or Bearer token provided
 * - TOKEN_EXPIRED: Token has expired
 * - INVALID_TOKEN: Token is malformed or has invalid signature
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Check for Authorization header with Bearer scheme
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        message: 'No token provided',
        code: 'NO_TOKEN',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Handle empty token after "Bearer "
  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        message: 'No token provided',
        code: 'NO_TOKEN',
      },
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        },
      });
      return;
    }

    // JsonWebTokenError covers both malformed tokens and invalid signatures
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
  }
}

export default authMiddleware;
