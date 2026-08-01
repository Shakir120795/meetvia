import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/public/cities
 * Returns active cities sorted by displayOrder ascending.
 */
export async function getCities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cities = await prisma.city.findMany({
      where: { status: 'active' },
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
}
