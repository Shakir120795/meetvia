import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/how-it-works
 * Get all How It Works steps sorted by displayOrder ascending.
 */
export async function getHowItWorksSteps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const steps = await prisma.howItWorksStep.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.status(200).json({ success: true, data: steps });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/how-it-works
 * Replace all How It Works steps with the provided array.
 * Accepts { steps: [...] } with max 10 steps.
 */
export async function updateHowItWorksSteps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { steps } = req.body;

    // Delete all existing steps and insert new ones in a transaction
    const newSteps = steps.map((step: any, index: number) => ({
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description,
      displayOrder: index,
    }));

    await prisma.$transaction([
      prisma.howItWorksStep.deleteMany(),
      prisma.howItWorksStep.createMany({ data: newSteps }),
    ]);

    const createdSteps = await prisma.howItWorksStep.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    res.status(200).json({ success: true, data: createdSteps });
  } catch (error) {
    next(error);
  }
}
