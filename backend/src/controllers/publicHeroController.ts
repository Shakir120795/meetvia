import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/public/hero-slides
 * Returns visible hero slides sorted by displayOrder ascending.
 */
export async function getHeroSlides(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: slides });
  } catch (error) {
    next(error);
  }
}
