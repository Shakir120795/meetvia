import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/public/footer
 * Returns the footer description (from SiteSettings metaDescription) and
 * visible social links sorted by displayOrder ascending.
 */
export async function getFooter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const siteSettings = await prisma.siteSettings.findFirst();
    const socialLinks = await prisma.socialLink.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({
      success: true,
      data: {
        description: siteSettings?.metaDescription || null,
        socialLinks,
      },
    });
  } catch (error) {
    next(error);
  }
}
