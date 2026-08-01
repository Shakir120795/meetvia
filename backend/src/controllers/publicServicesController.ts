import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/public/services
 * Returns all visible services sorted by displayOrder ascending.
 */
export async function getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const services = await prisma.service.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/public/services/featured
 * Returns featured visible services (max 6). If fewer than 6 featured,
 * fills with first visible services up to 6 total.
 */
export async function getFeaturedServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const featured = await prisma.service.findMany({
      where: { isVisible: true, isFeatured: true },
      orderBy: { displayOrder: 'asc' },
      take: 6,
    });

    if (featured.length >= 6) {
      res.json({ success: true, data: featured });
      return;
    }

    // Fill remaining slots with non-featured visible services
    const featuredIds = featured.map((s) => s.id);
    const remaining = 6 - featured.length;
    const filler = await prisma.service.findMany({
      where: {
        isVisible: true,
        id: { notIn: featuredIds },
      },
      orderBy: { displayOrder: 'asc' },
      take: remaining,
    });

    const combined = [...featured, ...filler];
    res.json({ success: true, data: combined });
  } catch (error) {
    next(error);
  }
}
