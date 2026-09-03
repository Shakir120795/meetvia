import { Request, Response, NextFunction } from 'express';
import { getRequiredStringParam } from '../utils/params';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/companions
 * List all companion applications with optional filter by status.
 */
export async function getCompanions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.query;
    const where: Record<string, any> = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const applications = await prisma.companionApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/companions/:id
 * Update companion application status and/or admin notes.
 */
export async function updateCompanion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getRequiredStringParam(req.params.id, "ID");
    const { status, adminNotes } = req.body;

    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const application = await prisma.companionApplication.update({
      where: { id: getRequiredStringParam(req.params.id, "ID") },
      data: updateData,
    });

    res.status(200).json({ success: true, data: application });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Companion application not found' },
      });
      return;
    }
    next(error);
  }
}
