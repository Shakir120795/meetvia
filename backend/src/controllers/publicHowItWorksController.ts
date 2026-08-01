import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/public/how-it-works
 * Returns How It Works steps sorted by displayOrder ascending.
 */
export async function getHowItWorksSteps(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const steps = await prisma.howItWorksStep.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: steps });
  } catch (error) {
    next(error);
  }
}
