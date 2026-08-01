import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/footer
 * Get footer settings (description from SiteSettings.metaDescription).
 */
export async function getFooter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      res.status(404).json({
        success: false,
        error: { message: 'Site settings not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        description: settings.metaDescription || '',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/footer
 * Update footer description in SiteSettings.
 */
export async function updateFooter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { description } = req.body;

    if (description === undefined || description === null) {
      res.status(400).json({
        success: false,
        error: { message: 'Description is required', field: 'description', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    const existing = await prisma.siteSettings.findFirst();

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { message: 'Site settings not found' },
      });
      return;
    }

    const settings = await prisma.siteSettings.update({
      where: { id: existing.id },
      data: { metaDescription: description },
    });

    res.status(200).json({
      success: true,
      data: {
        description: settings.metaDescription || '',
      },
    });
  } catch (error) {
    next(error);
  }
}
