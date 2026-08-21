import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const users = await prisma.user.findMany({
      where: status ? { status: status as any } : undefined,
      select: {
        id: true, email: true, mobile: true, status: true, emailVerifiedAt: true,
        mobileVerifiedAt: true, createdAt: true, updatedAt: true,
        profile: { select: { displayName: true, avatarUrl: true } },
        roles: { select: { role: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) { next(error); }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(status)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Invalid user status' } });
      return;
    }
    const user = await prisma.user.update({ where: { id }, data: { status } });
    res.status(200).json({ success: true, data: { id: user.id, status: user.status } });
  } catch (error: any) {
    if (error?.code === 'P2025') { res.status(404).json({ success: false, error: { message: 'User not found' } }); return; }
    next(error);
  }
}
