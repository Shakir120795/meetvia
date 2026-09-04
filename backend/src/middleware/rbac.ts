import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user || user.userType !== 'ADMIN' || !user.adminUserId) {
        res.status(403).json({
          success: false,
          error: { message: 'Admin access required' }
        });
        return;
      }

      // Check if user is super admin (has all permissions)
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: user.adminUserId }
      });

      if (!adminUser || !adminUser.isActive) {
        res.status(403).json({
          success: false,
          error: { message: 'Admin account is inactive' }
        });
        return;
      }

      if (adminUser.isSuperAdmin) {
        // Super admin has all permissions
        next();
        return;
      }

      // Check if user has the specific permission
      const hasPermission = await prisma.adminRolePermission.findFirst({
        where: {
          adminUserId: user.adminUserId,
          permission: {
            key: permissionKey
          }
        }
      });

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: { 
            message: `Permission required: ${permissionKey}`,
            code: 'INSUFFICIENT_PERMISSIONS'
          }
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to ensure user type matches required type
 */
export function requireUserType(userType: 'USER' | 'COMPANION' | 'ADMIN') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || user.userType !== userType) {
      res.status(403).json({
        success: false,
        error: { 
          message: `${userType} access required`,
          code: 'INVALID_USER_TYPE'
        }
      });
      return;
    }

    next();
  };
}