import { hashPassword, comparePassword } from './password';

describe('Password utilities', () => {
  describe('hashPassword', () => {
    it('should return a bcrypt hash string', async () => {
      const hash = await hashPassword('TestPassword123!');
      expect(typeof hash).toBe('string');
      // bcrypt hashes start with $2a$ or $2b$
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should produce a hash with cost factor 10', async () => {
      const hash = await hashPassword('TestPassword123!');
      // bcrypt format: $2a$10$... (10 is the cost factor)
      expect(hash).toMatch(/^\$2[ab]\$10\$/);
    });

    it('should produce different hashes for the same password (different salts)', async () => {
      const hash1 = await hashPassword('SamePassword');
      const hash2 = await hashPassword('SamePassword');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true when password matches the hash', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false when password does not match the hash', async () => {
      const hash = await hashPassword('OriginalPassword');
      const result = await comparePassword('WrongPassword', hash);
      expect(result).toBe(false);
    });

    it('should handle empty string password', async () => {
      const hash = await hashPassword('');
      const result = await comparePassword('', hash);
      expect(result).toBe(true);
    });

    it('should handle special characters in passwords', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });
  });
});
