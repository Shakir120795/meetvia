import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * Get all testimonials sorted by displayOrder ascending.
 */
export async function getAllTestimonials(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new testimonial.
 */
export async function createTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const testimonial = await prisma.testimonial.create({ data: req.body });
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a testimonial by ID.
 */
export async function updateTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json({ success: true, data: testimonial });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Testimonial not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * Toggle isVerified for a testimonial.
 */
export async function toggleVerified(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      res.status(400).json({
        success: false,
        error: { message: 'isVerified must be a boolean', field: 'isVerified', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { isVerified },
    });

    res.status(200).json({ success: true, data: testimonial });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Testimonial not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * Toggle isVisible for a testimonial.
 */
export async function toggleVisibility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;

    if (typeof isVisible !== 'boolean') {
      res.status(400).json({
        success: false,
        error: { message: 'isVisible must be a boolean', field: 'isVisible', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { isVisible },
    });

    res.status(200).json({ success: true, data: testimonial });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Testimonial not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * Delete a testimonial by ID.
 */
export async function deleteTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.testimonial.delete({ where: { id } });
    res.status(200).json({ success: true, data: { message: 'Testimonial deleted successfully' } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Testimonial not found' },
      });
      return;
    }
    next(error);
  }
}
