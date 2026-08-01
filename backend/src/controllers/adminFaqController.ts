import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * Get all FAQs sorted by displayOrder ascending.
 */
export async function getAllFaqs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new FAQ. Rejects empty question or answer.
 */
export async function createFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { question, answer } = req.body;

    // Additional check: reject whitespace-only question/answer
    if (!question || question.trim() === '') {
      res.status(400).json({
        success: false,
        error: { message: 'Question is required', field: 'question', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    if (!answer || answer.trim() === '') {
      res.status(400).json({
        success: false,
        error: { message: 'Answer is required', field: 'answer', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    const faq = await prisma.fAQ.create({ data: req.body });
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a FAQ by ID.
 */
export async function updateFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    // If question or answer is being updated, reject if whitespace-only
    if (req.body.question !== undefined && req.body.question.trim() === '') {
      res.status(400).json({
        success: false,
        error: { message: 'Question is required', field: 'question', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    if (req.body.answer !== undefined && req.body.answer.trim() === '') {
      res.status(400).json({
        success: false,
        error: { message: 'Answer is required', field: 'answer', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json({ success: true, data: faq });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'FAQ not found' },
      });
      return;
    }
    next(error);
  }
}

/**
 * Bulk reorder FAQs. Accepts { items: [{ id, displayOrder }] }.
 */
export async function reorderFaqs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({
        success: false,
        error: { message: 'Items array is required', field: 'items', code: 'VALIDATION_ERROR' },
      });
      return;
    }

    // Use a transaction to update all display orders
    await prisma.$transaction(
      items.map((item: { id: string; displayOrder: number }) =>
        prisma.fAQ.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    const faqs = await prisma.fAQ.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a FAQ by ID.
 */
export async function deleteFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { id } });
    res.status(200).json({ success: true, data: { message: 'FAQ deleted successfully' } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'FAQ not found' },
      });
      return;
    }
    next(error);
  }
}
