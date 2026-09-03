import { Request, Response, NextFunction } from 'express';
import { getRequiredStringParam } from '../utils/params';
import prisma from '../config/db';

/**
 * GET /api/v1/public/pages/:slug
 * Returns a legal page by slug. Returns 404 if not found.
 */
export async function getPageBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = getRequiredStringParam(req.params.slug, "slug");
    const page = await prisma.legalPage.findUnique({ where: { slug: getRequiredStringParam(req.params.slug, "slug") } });

    if (!page) {
      res.status(404).json({
        success: false,
        error: { message: 'Page not found' },
      });
      return;
    }

    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
}
