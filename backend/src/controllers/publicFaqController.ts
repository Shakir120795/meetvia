import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/public/faq
 * Returns all FAQs sorted by displayOrder ascending.
 */
export async function getAllFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: faqs });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/public/faq/preview
 * Returns the first 6 FAQs sorted by displayOrder ascending.
 */
export async function getFaqPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { displayOrder: 'asc' },
      take: 6,
    });
    res.json({ success: true, data: faqs });
  } catch (error) {
    next(error);
  }
}
