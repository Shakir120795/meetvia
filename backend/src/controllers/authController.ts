import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { signToken } from '../utils/jwt';
import { comparePassword } from '../utils/password';
import env from '../config/env';

/**
 * Admin login controller.
 * Validates credentials against the database, returns a signed JWT on success.
 * Returns a generic error message on failure to avoid leaking which field is wrong.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find admin user by email
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' },
      });
      return;
    }

    // Compare password with stored hash
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' },
      });
      return;
    }

    // Sign JWT with userId and email
    const token = signToken({ 
      adminUserId: user.id, 
      email: user.email, 
      userType: 'ADMIN' 
    });

    // Calculate expiresAt based on JWT_EXPIRY
    const expiresAt = calculateExpiresAt(env.JWT_EXPIRY);

    res.status(200).json({
      success: true,
      data: { token, expiresAt },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Calculate the expiration date from a JWT expiry string (e.g., '24h', '7d', '3600').
 */
function calculateExpiresAt(expiry: string): string {
  const now = Date.now();
  let ms = 0;

  // Match patterns like '24h', '7d', '60m', '3600s', or raw seconds
  const match = expiry.match(/^(\d+)(h|d|m|s)?$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2] || 's';

    switch (unit) {
      case 'h':
        ms = value * 60 * 60 * 1000;
        break;
      case 'd':
        ms = value * 24 * 60 * 60 * 1000;
        break;
      case 'm':
        ms = value * 60 * 1000;
        break;
      case 's':
      default:
        ms = value * 1000;
        break;
    }
  } else {
    // Default to 24 hours if format is unrecognized
    ms = 24 * 60 * 60 * 1000;
  }

  return new Date(now + ms).toISOString();
}
