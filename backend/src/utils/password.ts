import bcrypt from 'bcryptjs';

/**
 * The bcrypt cost factor used for hashing. Must be at least 10 per requirements.
 */
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt with cost factor 10.
 *
 * @param password - The plain text password to hash
 * @returns The bcrypt hash string
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password against a bcrypt hash.
 *
 * @param password - The plain text password to verify
 * @param hash - The bcrypt hash to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export default { hashPassword, comparePassword };
