import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/public/site-settings
 * Returns the site settings singleton document.
 * If no settings exist, returns sensible defaults.
 */
export async function getSiteSettings(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      // Return sensible defaults if no settings exist yet
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Meetvia',
          metaTitle: 'Meetvia',
          metaDescription: 'Professional city assistance and visitor support services in India',
        },
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}
