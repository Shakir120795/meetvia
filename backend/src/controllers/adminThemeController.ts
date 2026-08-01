import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/theme
 * Returns the current theme settings.
 */
export async function getTheme(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let theme = await prisma.themeSettings.findFirst();
    if (!theme) {
      theme = await prisma.themeSettings.create({
        data: {
          activePreset: 'futuristic_blue',
          primaryColor: '#FFFFFF',
          secondaryColor: '#0A1628',
          accentColor: '#00D4FF',
          backgroundColor: '#0A1628',
          textColor: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 12,
          glassmorphismIntensity: 50,
        },
      });
    }
    res.json({ success: true, data: theme });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/theme
 * Update theme settings (singleton — upserts if none exists).
 */
export async function updateTheme(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await prisma.themeSettings.findFirst();

    let theme;
    if (existing) {
      theme = await prisma.themeSettings.update({
        where: { id: existing.id },
        data: req.body,
      });
    } else {
      theme = await prisma.themeSettings.create({
        data: {
          activePreset: 'futuristic_blue',
          primaryColor: '#FFFFFF',
          secondaryColor: '#0A1628',
          accentColor: '#00D4FF',
          backgroundColor: '#0A1628',
          textColor: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 12,
          glassmorphismIntensity: 50,
          ...req.body,
        },
      });
    }

    res.json({ success: true, data: theme });
  } catch (error) {
    next(error);
  }
}
