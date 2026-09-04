import redisManager from '../config/redis';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

interface OtpData {
  otpHash: string;
  purpose: string;
  attempts: number;
  maxAttempts: number;
}

export class OtpService {
  private static readonly OTP_LENGTH = 6;
  private static readonly OTP_TTL = 600; // 10 minutes in seconds
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly RATE_LIMIT_TTL = 900; // 15 minutes in seconds

  /**
   * Generate and store OTP for the given identifier (email or phone)
   */
  static async generateOtp(identifier: string, purpose: string): Promise<{ otp: string; expiresAt: Date }> {
    const redis = redisManager.getClient();
    const rateLimitKey = `otp_rate_limit:${identifier}`;
    const otpKey = `otp:${identifier}:${purpose}`;

    // Check rate limiting
    const rateLimitCount = await redis.get(rateLimitKey);
    if (rateLimitCount && parseInt(rateLimitCount) >= 3) {
      throw new Error('Too many OTP requests. Please try again in 15 minutes.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const otpData: OtpData = {
      otpHash,
      purpose,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS
    };

    // Store OTP data with TTL
    await redis.setEx(otpKey, this.OTP_TTL, JSON.stringify(otpData));

    // Increment rate limit counter
    const currentCount = await redis.incr(rateLimitKey);
    if (currentCount === 1) {
      await redis.expire(rateLimitKey, this.RATE_LIMIT_TTL);
    }

    const expiresAt = new Date(Date.now() + this.OTP_TTL * 1000);

    return { otp, expiresAt };
  }

  /**
   * Verify OTP against stored hash
   */
  static async verifyOtp(identifier: string, purpose: string, otp: string): Promise<{ valid: boolean; error?: string }> {
    const redis = redisManager.getClient();
    const otpKey = `otp:${identifier}:${purpose}`;
    
    const otpDataJson = await redis.get(otpKey);
    if (!otpDataJson) {
      return { valid: false, error: 'OTP expired or not found' };
    }

    const otpData: OtpData = JSON.parse(otpDataJson);

    // Check if max attempts exceeded
    if (otpData.attempts >= otpData.maxAttempts) {
      await redis.del(otpKey); // Clean up
      return { valid: false, error: 'Maximum attempts exceeded' };
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpData.otpHash);
    
    if (!isValid) {
      // Increment attempt count
      otpData.attempts += 1;
      const ttl = await redis.ttl(otpKey);
      await redis.setEx(otpKey, ttl > 0 ? ttl : this.OTP_TTL, JSON.stringify(otpData));
      
      const remainingAttempts = otpData.maxAttempts - otpData.attempts;
      return { 
        valid: false, 
        error: remainingAttempts > 0 ? `Invalid OTP. ${remainingAttempts} attempts remaining.` : 'Maximum attempts exceeded'
      };
    }

    // Valid OTP - clean up
    await redis.del(otpKey);
    return { valid: true };
  }

  /**
   * Clear OTP for the given identifier (cleanup on successful verification)
   */
  static async clearOtp(identifier: string, purpose: string): Promise<void> {
    const redis = redisManager.getClient();
    const otpKey = `otp:${identifier}:${purpose}`;
    await redis.del(otpKey);
  }
}