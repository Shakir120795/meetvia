import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuditLogService } from '../services/auditLogService';

/**
 * Get all permissions
 */
export async function getAllPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { label: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: { permissions }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new permission
 */
export async function createPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key, label } = req.body;
    const adminUserId = req.user?.adminUserId;

    if (!key || !label) {
      res.status(400).json({
        success: false,
        error: { message: 'Key and label are required' }
      });
      return;
    }

    // Check if permission key already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { key }
    });

    if (existingPermission) {
      res.status(409).json({
        success: false,
        error: { message: 'Permission with this key already exists' }
      });
      return;
    }

    const permission = await prisma.permission.create({
      data: {
        key: key.toUpperCase(),
        label: label.trim()
      }
    });

    // Log the action
    await AuditLogService.log('ADMIN', adminUserId!, 'CREATE_PERMISSION', 'PERMISSION', permission.id, req.ip);

    res.status(201).json({
      success: true,
      data: { permission }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update permission
 */
export async function updatePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { key, label } = req.body;
    const adminUserId = req.user?.adminUserId;

    if (!key || !label) {
      res.status(400).json({
        success: false,
        error: { message: 'Key and label are required' }
      });
      return;
    }

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id }
    });

    if (!existingPermission) {
      res.status(404).json({
        success: false,
        error: { message: 'Permission not found' }
      });
      return;
    }

    // Check if new key conflicts with another permission
    if (key !== existingPermission.key) {
      const conflictingPermission = await prisma.permission.findUnique({
        where: { key }
      });

      if (conflictingPermission) {
        res.status(409).json({
          success: false,
          error: { message: 'Permission with this key already exists' }
        });
        return;
      }
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        key: key.toUpperCase(),
        label: label.trim()
      }
    });

    // Log the action
    await AuditLogService.log('ADMIN', adminUserId!, 'UPDATE_PERMISSION', 'PERMISSION', permission.id, req.ip);

    res.status(200).json({
      success: true,
      data: { permission }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete permission
 */
export async function deletePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const adminUserId = req.user?.adminUserId;

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id }
    });

    if (!existingPermission) {
      res.status(404).json({
        success: false,
        error: { message: 'Permission not found' }
      });
      return;
    }

    // Check if permission is in use
    const inUse = await prisma.adminRolePermission.findFirst({
      where: { permissionId: id }
    });

    if (inUse) {
      res.status(409).json({
        success: false,
        error: { message: 'Cannot delete permission that is assigned to users' }
      });
      return;
    }

    await prisma.permission.delete({
      where: { id }
    });

    // Log the action
    await AuditLogService.log('ADMIN', adminUserId!, 'DELETE_PERMISSION', 'PERMISSION', id, req.ip);

    res.status(200).json({
      success: true,
      data: { message: 'Permission deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
}