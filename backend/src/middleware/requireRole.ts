import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export type AppRole = 'CUSTOMER' | 'COMPANION' | 'ADMIN';

export function requireRole(...allowedRoles: AppRole[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Authentication required', code: 'AUTH_REQUIRED' } });
      return;
    }

    try {
      const assignments = await prisma.userRoleAssignment.findMany({
        where: { userId, role: { in: allowedRoles } },
        select: { role: true },
      });

      if (!assignments.length) {
        res.status(403).json({ success: false, error: { message: 'Insufficient permissions', code: 'FORBIDDEN' } });
        return;
      }

      next();
    } catch {
      res.status(500).json({ success: false, error: { message: 'Unable to verify role', code: 'ROLE_CHECK_FAILED' } });
    }
  };
}
