import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AuditLogService } from '../services/auditLogService';

/**
 * Register new companion
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, phone, bio, cityId, gender, languagesSpoken } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: { message: 'Name, email and password are required' }
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if companion already exists
    const existingCompanion = await prisma.companion.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingCompanion) {
      res.status(409).json({
        success: false,
        error: { message: 'Companion already exists with this email' }
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create companion
    const companion = await prisma.companion.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone?.trim(),
        bio: bio?.trim(),
        cityId,
        gender: gender?.trim(),
        languagesSpoken: languagesSpoken || [],
        verificationStatus: 'PENDING'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        verificationStatus: true,
        createdAt: true
      }
    });

    // Log the registration
    await AuditLogService.log('COMPANION', companion.id, 'REGISTER', 'COMPANION', companion.id, req.ip);

    res.status(201).json({
      success: true,
      data: { companion }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Companion login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' }
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find companion
    const companion = await prisma.companion.findUnique({
      where: { email: normalizedEmail },
      include: {
        city: {
          select: { id: true, cityName: true, state: true }
        }
      }
    });

    if (!companion) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
      return;
    }

    // Check if companion is active
    if (!companion.isActive) {
      res.status(403).json({
        success: false,
        error: { message: 'Account is deactivated. Please contact support.' }
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, companion.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
      return;
    }

    // Generate JWT token
    const token = signToken({
      companionId: companion.id,
      email: companion.email,
      userType: 'COMPANION'
    });

    // Log successful login
    await AuditLogService.log('COMPANION', companion.id, 'LOGIN', 'COMPANION', companion.id, req.ip);

    res.status(200).json({
      success: true,
      data: {
        token,
        companion: {
          id: companion.id,
          name: companion.name,
          email: companion.email,
          phone: companion.phone,
          bio: companion.bio,
          city: companion.city,
          verificationStatus: companion.verificationStatus,
          verificationLevel: companion.verificationLevel,
          bookingMode: companion.bookingMode
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get companion profile
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companionId = req.user?.companionId;

    if (!companionId) {
      res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' }
      });
      return;
    }

    const companion = await prisma.companion.findUnique({
      where: { id: companionId },
      include: {
        city: {
          select: { id: true, cityName: true, state: true, country: true }
        }
      }
    });

    if (!companion) {
      res.status(404).json({
        success: false,
        error: { message: 'Companion not found' }
      });
      return;
    }

    // Remove sensitive data
    const { passwordHash, ...companionData } = companion;

    res.status(200).json({
      success: true,
      data: { companion: companionData }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update companion profile
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companionId = req.user?.companionId;
    const { 
      name, 
      phone, 
      bio, 
      cityId, 
      gender, 
      languagesSpoken, 
      servesTourists, 
      servesLocals, 
      specializationTags,
      payoutFrequency 
    } = req.body;

    if (!companionId) {
      res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' }
      });
      return;
    }

    const companion = await prisma.companion.update({
      where: { id: companionId },
      data: {
        name: name?.trim(),
        phone: phone?.trim(),
        bio: bio?.trim(),
        cityId,
        gender: gender?.trim(),
        languagesSpoken: languagesSpoken || [],
        servesTourists,
        servesLocals,
        specializationTags: specializationTags || [],
        payoutFrequency
      },
      include: {
        city: {
          select: { id: true, cityName: true, state: true, country: true }
        }
      }
    });

    // Remove sensitive data
    const { passwordHash, ...companionData } = companion;

    // Log the action
    await AuditLogService.log('COMPANION', companionId, 'PROFILE_UPDATE', 'COMPANION', companionId, req.ip);

    res.status(200).json({
      success: true,
      data: { companion: companionData }
    });
  } catch (error) {
    next(error);
  }
}