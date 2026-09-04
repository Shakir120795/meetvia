import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { OtpService } from '../services/otpService';
import { EmailService } from '../services/emailService';
import { signToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import { AuditLogService } from '../services/auditLogService';

/**
 * Send OTP for email verification or login
 */
export async function sendEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    console.log('sendEmailOtp called with body:', req.body);
    const { email, purpose = 'LOGIN' } = req.body;

    if (!email || !email.includes('@')) {
      res.status(400).json({
        success: false,
        error: { message: 'Valid email is required' }
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if purpose is LOGIN and user doesn't exist, create them
    if (purpose === 'LOGIN') {
      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            authProvider: 'email',
            emailVerified: false
          }
        });
      }
    }

    // Generate and send OTP
    const { otp, expiresAt } = await OtpService.generateOtp(normalizedEmail, purpose);
    await EmailService.sendOtpEmail(normalizedEmail, otp, purpose);

    // Log the action
    await AuditLogService.log('USER', null, 'OTP_REQUESTED', 'USER', null, req.ip);

    res.status(200).json({
      success: true,
      data: {
        message: 'OTP sent to your email',
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in sendEmailOtp:', error);
    next(error);
  }
}

/**
 * Verify OTP and login user
 */
export async function verifyEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp, purpose = 'LOGIN' } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        error: { message: 'Email and OTP are required' }
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const { valid, error } = await OtpService.verifyOtp(normalizedEmail, purpose, otp);

    if (!valid) {
      res.status(400).json({
        success: false,
        error: { message: error }
      });
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          authProvider: 'email',
          emailVerified: true
        }
      });
    } else if (!user.emailVerified) {
      // Mark email as verified
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      });
    }

    // Generate JWT token
    const token = signToken({ 
      userId: user.id, 
      email: user.email, 
      userType: 'USER' 
    });

    // Log successful login
    await AuditLogService.log('USER', user.id, 'LOGIN', 'USER', user.id, req.ip);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' }
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        isVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { name, phone } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' }
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name?.trim(),
        phone: phone?.trim()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        isVerified: true
      }
    });

    // Log the action
    await AuditLogService.log('USER', userId, 'PROFILE_UPDATE', 'USER', userId, req.ip);

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}