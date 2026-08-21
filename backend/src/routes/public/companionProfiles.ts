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

router.get('/', async (_req, res, next) => {
  try {
    const companions = await prisma.user.findMany({
      where: { status: 'ACTIVE', roles: { some: { role: { name: 'COMPANION' } } } },
      include: { profile: true, experiences: { where: { status: 'PUBLISHED' }, take: 3, include: { city: true } } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    res.json({ success: true, data: companions.map((companion) => ({ id: companion.id, profile: companion.profile, experiences: companion.experiences })) });
  } catch (error) { next(error); }
});

export default router;
