import { Request, Response, NextFunction } from 'express';
import { getRequiredStringParam } from '../utils/params';
import prisma from '../config/db';

/**
 * GET /api/v1/admin/pages/:slug
 * Get a legal page by slug.
 */
export async function getLegalPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = getRequiredStringParam(req.params.slug, "slug");
    const page = await prisma.legalPage.findUnique({ where: { slug: getRequiredStringParam(req.params.slug, "slug") } });

    if (!page) {
      res.status(404).json({
        success: false,
        error: { message: 'Legal page not found' },
      });
      return;
    }

    res.status(200).json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/pages/:slug
 * Update a legal page's title and content by slug.
 */
export async function updateLegalPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = getRequiredStringParam(req.params.slug, "slug");
    const { title, content } = req.body;

    const page = await prisma.legalPage.update({
      where: { slug: getRequiredStringParam(req.params.slug, "slug") },
      data: { title, content },
    });

    res.status(200).json({ success: true, data: page });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Legal page not found' },
      });
      return;
    }
    next(error);
  }
}
