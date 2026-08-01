import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/site-settings
 * Returns the current site settings.
 */
export async function getSiteSettings(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Meetvia',
          metaTitle: 'Meetvia',
          metaDescription: 'Professional public companionship and visitor assistance platform',
        },
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/site-settings
 * Update site settings (singleton — upserts if none exists).
 */
export async function updateSiteSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await prisma.siteSettings.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.siteSettings.update({
        where: { id: existing.id },
        data: req.body,
      });
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Meetvia',
          metaTitle: 'Meetvia',
          ...req.body,
        },
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}
