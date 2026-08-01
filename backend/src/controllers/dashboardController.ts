import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/dashboard/stats
 * Returns aggregate counts for dashboard overview statistics.
 */
export async function getDashboardStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [
      services,
      inquiries,
      newInquiries,
      applications,
      faqs,
      testimonials,
      activeCities,
      media,
    ] = await Promise.all([
      prisma.service.count(),
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: 'new_status' } }),
      prisma.companionApplication.count(),
      prisma.fAQ.count(),
      prisma.testimonial.count(),
      prisma.city.count({ where: { status: 'active' } }),
      prisma.media.count(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        services,
        inquiries,
        newInquiries,
        applications,
        faqs,
        testimonials,
        activeCities,
        media,
      },
    });
  } catch (error) {
    next(error);
  }
}
