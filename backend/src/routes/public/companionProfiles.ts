import { Router } from 'express';
import prisma from '../../config/db';

const router = Router();

function parseDateAndTime(date: string, time: string) {
  if (!date && !time) return null;
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const weekday = date ? new Date(`${date}T12:00:00Z`).getUTCDay() : undefined;
  const minute = time ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) : undefined;
  return { weekday, minute };
}

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
    const experience = String(req.query.experience || '').trim();
    const date = String(req.query.date || '').trim();
    const time = String(req.query.time || '').trim();
    const availability = parseDateAndTime(date, time);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const experienceWhere = {
      status: 'PUBLISHED' as const,
      ...(city ? { city: { cityName: { contains: city, mode: 'insensitive' as const } } } : {}),
      ...(experience ? { OR: [
        { title: { contains: experience, mode: 'insensitive' as const } },
        { category: { contains: experience, mode: 'insensitive' as const } },
      ] } : {}),
    };

    const where = {
      status: 'ACTIVE' as const,
      roles: { some: { role: { name: 'COMPANION' as const } } },
      ...(city || experience ? { experiences: { some: experienceWhere } } : {}),
      ...(availability?.weekday !== undefined ? { availability: { some: {
        isActive: true,
        weekday: availability.weekday,
        ...(availability.minute !== undefined ? { startMinute: { lte: availability.minute }, endMinute: { gte: availability.minute } } } : {}),
      } } } : {}),
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
      prisma.user.findMany({ where, include: { profile: true, experiences: { where: { status: 'PUBLISHED' }, take: 3, include: { city: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: companions.map((companion) => ({ id: companion.id, profile: companion.profile, experiences: companion.experiences })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

export default router;
