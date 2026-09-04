import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuditLogService } from '../services/auditLogService';

/**
 * Get all feature toggles
 */
export async function getFeatureToggles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const toggles = await prisma.siteFeatureToggle.findMany({
      orderBy: { key: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: { toggles }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific feature toggle by key
 */
export async function getFeatureToggle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key } = req.params;

    const toggle = await prisma.siteFeatureToggle.findUnique({
      where: { key }
    });

    if (!toggle) {
      res.status(404).json({
        success: false,
        error: { message: 'Feature toggle not found' }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { toggle }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update feature toggle
 */
export async function upsertFeatureToggle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key, value, isEnabled } = req.body;
    const adminUserId = req.user?.adminUserId;

    if (!key) {
      res.status(400).json({
        success: false,
        error: { message: 'Key is required' }
      });
      return;
    }

    const toggle = await prisma.siteFeatureToggle.upsert({
      where: { key },
      update: {
        value: value || {},
        isEnabled: isEnabled !== undefined ? isEnabled : true
      },
      create: {
        key,
        value: value || {},
        isEnabled: isEnabled !== undefined ? isEnabled : true
      }
    });

    // Log the action
    const action = toggle.createdAt === toggle.updatedAt ? 'CREATE_FEATURE_TOGGLE' : 'UPDATE_FEATURE_TOGGLE';
    await AuditLogService.log('ADMIN', adminUserId!, action, 'FEATURE_TOGGLE', toggle.id, req.ip);

    res.status(200).json({
      success: true,
      data: { toggle }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete feature toggle
 */
export async function deleteFeatureToggle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key } = req.params;
    const adminUserId = req.user?.adminUserId;

    const existingToggle = await prisma.siteFeatureToggle.findUnique({
      where: { key }
    });

    if (!existingToggle) {
      res.status(404).json({
        success: false,
        error: { message: 'Feature toggle not found' }
      });
      return;
    }

    await prisma.siteFeatureToggle.delete({
      where: { key }
    });

    // Log the action
    await AuditLogService.log('ADMIN', adminUserId!, 'DELETE_FEATURE_TOGGLE', 'FEATURE_TOGGLE', existingToggle.id, req.ip);

    res.status(200).json({
      success: true,
      data: { message: 'Feature toggle deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
}