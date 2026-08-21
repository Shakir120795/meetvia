import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/db';

export interface CustomerAuthRequest extends Request {
  customer?: {
    id: string;
    email: string | null;
    mobile: string | null;
    status: string;
    roles: string[];
  };
}

const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

export async function requireCustomerAuth(
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
    }

    const token = header.slice(7).trim();
    if (!token) return res.status(401).json({ success: false, error: { message: 'Authentication required' } });

    const session = await prisma.session.findUnique({
      where: { tokenHash: hash(token) },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return res.status(401).json({ success: false, error: { message: 'Session expired or invalid' } });
    }

    if (session.user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, error: { message: 'Account is not active' } });
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    req.customer = {
      id: session.user.id,
      email: session.user.email,
      mobile: session.user.mobile,
      status: session.user.status,
      roles: session.user.roles.map((assignment) => assignment.role.name),
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
