import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/public/theme
 * Returns the active theme settings singleton.
 * If no theme exists, returns default Futuristic Blue preset.
 */
export async function getThemeSettings(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let theme = await prisma.themeSettings.findFirst();
    if (!theme) {
      // Return default Futuristic Blue preset
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
