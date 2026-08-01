import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/social-links
 * List all social links sorted by displayOrder ascending.
 */
export async function getSocialLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const socialLinks = await prisma.socialLink.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.status(200).json({ success: true, data: socialLinks });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/admin/social-links
 * Create a new social link.
 */
export async function createSocialLink(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const socialLink = await prisma.socialLink.create({ data: req.body });
    res.status(201).json({ success: true, data: socialLink });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/social-links/:id
 * Update a social link by ID.
 */
export async function updateSocialLink(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const socialLink = await prisma.socialLink.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json({ success: true, data: socialLink });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Social link not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * DELETE /api/v1/admin/social-links/:id
 * Delete a social link by ID.
 */
export async function deleteSocialLink(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.socialLink.delete({ where: { id } });
    res.status(200).json({ success: true, data: { message: 'Social link deleted successfully' } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Social link not found' },
      });
      return;
    }
    next(error);
  }
}
