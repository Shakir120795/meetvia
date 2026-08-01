import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/public/testimonials
 * Returns verified and visible testimonials sorted by displayOrder ascending.
 */
export async function getTestimonials(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isVerified: true, isVisible: true },
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/public/testimonials/preview
 * Returns max 3 verified and visible testimonials sorted by displayOrder ascending.
 */
export async function getTestimonialsPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isVerified: true, isVisible: true },
      orderBy: { displayOrder: 'asc' },
      take: 3,
    });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
}
