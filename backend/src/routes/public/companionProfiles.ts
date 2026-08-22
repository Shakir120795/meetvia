import { Router } from 'express';
import prisma from '../../config/db';

const router = Router();

router.get('/:id', async (req, res, next) => {
  try {
    const companion = await prisma.user.findFirst({
      where: { id: req.params.id, status: 'ACTIVE', roles: { some: { role: { name: 'COMPANION' } } } },
      include: {
        profile: true,
        experiences: { where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, include: { city: true } },
        availability: { where: { isActive: true }, orderBy: { weekday: 'asc' } },
      },
    });
    if (!companion) return res.status(404).json({ success: false, error: { code: 'COMPANION_NOT_FOUND' } });
    res.json({ success: true, data: { id: companion.id, profile: companion.profile, experiences: companion.experiences, availability: companion.availability } });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const city = String(req.query.city || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const where = {
      status: 'ACTIVE' as const,
      roles: { some: { role: { name: 'COMPANION' as const } } },
      ...(city ? { experiences: { some: { status: 'PUBLISHED' as const, city: { cityName: { contains: city, mode: 'insensitive' as const } } } } } : {}),
      ...(q ? {
        OR: [
          { profile: { is: { displayName: { contains: q, mode: 'insensitive' as const } } } },
          { profile: { is: { firstName: { contains: q, mode: 'insensitive' as const } } } },
          { profile: { is: { lastName: { contains: q, mode: 'insensitive' as const } } } },
          { profile: { is: { bio: { contains: q, mode: 'insensitive' as const } } } },
          { experiences: { some: { status: 'PUBLISHED' as const, title: { contains: q, mode: 'insensitive' as const } } } },
          { experiences: { some: { status: 'PUBLISHED' as const, city: { cityName: { contains: q, mode: 'insensitive' as const } } } } },
        ],
      } : {}),
    };

    const [companions, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: true, experiences: { where: { status: 'PUBLISHED' }, take: 3, include: { city: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: companions.map((companion) => ({ id: companion.id, profile: companion.profile, experiences: companion.experiences })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
});

export default router;
