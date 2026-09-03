import { Request, Response, NextFunction } from 'express';
import { getRequiredStringParam } from '../utils/params';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/hero-slides
 * Returns all hero slides (including hidden ones) sorted by displayOrder.
 */
export async function getHeroSlides(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: slides });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/admin/hero-slides
 * Create a new hero slide.
 */
export async function createHeroSlide(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slide = await prisma.heroSlide.create({ data: req.body });
    res.status(201).json({ success: true, data: slide });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/hero-slides/:id
 * Update an existing hero slide.
 */
export async function updateHeroSlide(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slide = await prisma.heroSlide.update({
      where: { id: getRequiredStringParam(req.params.id, "ID") },
      data: req.body,
    });
    res.json({ success: true, data: slide });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Hero slide not found', code: 'NOT_FOUND' },
      });
      return;
    }
    next(error);
  }
}

/**
 * PUT /api/v1/admin/hero-slides/reorder
 * Bulk reorder hero slides. Accepts { slides: [{id, displayOrder}] }
 */
export async function reorderHeroSlides(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slides } = req.body;
    if (!Array.isArray(slides)) {
      res.status(400).json({
        success: false,
        error: { message: 'slides must be an array', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    await prisma.$transaction(
      slides.map((item: { id: string; displayOrder: number }) =>
        prisma.heroSlide.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    const updatedSlides = await prisma.heroSlide.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: updatedSlides });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/admin/hero-slides/:id/visibility
 * Toggle slide visibility. Accepts { isVisible: boolean }
 */
export async function toggleHeroSlideVisibility(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { isVisible } = req.body;
    if (typeof isVisible !== 'boolean') {
      res.status(400).json({
        success: false,
        error: { message: 'isVisible must be a boolean', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    const slide = await prisma.heroSlide.update({
      where: { id: getRequiredStringParam(req.params.id, "ID") },
      data: { isVisible },
    });
    res.json({ success: true, data: slide });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Hero slide not found', code: 'NOT_FOUND' },
      });
      return;
    }
    next(error);
  }
}

/**
 * DELETE /api/v1/admin/hero-slides/:id
 * Delete a hero slide.
 */
export async function deleteHeroSlide(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await prisma.heroSlide.delete({ where: { id: getRequiredStringParam(req.params.id, "ID") } });
    res.json({ success: true, data: { message: 'Hero slide deleted successfully' } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Hero slide not found', code: 'NOT_FOUND' },
      });
      return;
    }
    next(error);
  }
}
