import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/inquiries
 * List all inquiries with optional filter by status and search by fullName/email.
 */
export async function getInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const inquiries = await prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/inquiries/:id
 * Update inquiry status and/or admin notes.
 */
export async function updateInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const inquiry = await prisma.contactInquiry.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({ success: true, data: inquiry });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Inquiry not found' },
      });
      return;
    }
    next(error);
  }
}
