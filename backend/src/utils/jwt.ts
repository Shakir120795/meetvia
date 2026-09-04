import jwt, { JwtPayload as JwtStandardPayload } from 'jsonwebtoken';
import env from '../config/env';

/**
 * Payload stored within a signed JWT token.
 */
export interface TokenPayload {
  userId?: string;      // For regular users
  companionId?: string; // For companions  
  adminUserId?: string; // For admin users
  email: string;
  userType: 'USER' | 'COMPANION' | 'ADMIN';
}

/**
 * Decoded token combining our custom payload with standard JWT claims.
 */
export type DecodedToken = TokenPayload & JwtStandardPayload;

/**
 * Sign a JWT token with the given payload and configurable expiry.
 * Uses JWT_SECRET and JWT_EXPIRY from environment configuration.
 *
 * @param payload - Data to encode in the token (userId, email)
 * @param expiresIn - Optional override for token expiry (defaults to env.JWT_EXPIRY)
 * @returns The signed JWT string
 */
export function signToken(payload: TokenPayload, expiresIn?: string | number): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: (expiresIn || env.JWT_EXPIRY) as any,
  });
}

/**
 * Verify and decode a JWT token.
 * Throws JsonWebTokenError for malformed tokens, TokenExpiredError for expired tokens.
 *
 * @param token - The JWT string to verify
 * @returns The decoded payload
 * @throws JsonWebTokenError | TokenExpiredError
 */
export function verifyToken(token: string): DecodedToken {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return decoded as DecodedToken;
}

export default { signToken, verifyToken };
