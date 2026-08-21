import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();

const querySchema = Joi.object({
  cityId: Joi.string().trim(),
  category: Joi.string().trim().max(80),
  type: Joi.string().valid('LOCAL', 'CITY', 'TRAVEL'),
  language: Joi.string().trim().max(40),
  interest: Joi.string().trim().max(80),
  minPrice: Joi.number().integer().min(0),
  maxPrice: Joi.number().integer().min(0),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).options({ abortEarly: false, stripUnknown: true });

const createSchema = Joi.object({
  title: Joi.string().trim().min(3).max(140).required(),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).required(),
  description: Joi.string().trim().min(20).max(5000).required(),
  cityId: Joi.string().trim().allow(null, ''),
  type: Joi.string().valid('LOCAL', 'CITY', 'TRAVEL').default('LOCAL'),
  category: Joi.string().trim().min(2).max(80).required(),
  durationMinutes: Joi.number().integer().min(30).max(1440).required(),
  priceMinor: Joi.number().integer().min(0).required(),
  currency: Joi.string().trim().length(3).uppercase().default('INR'),
  languages: Joi.array().items(Joi.string().trim().max(40)).max(20).default([]),
  interests: Joi.array().items(Joi.string().trim().max(80)).max(30).default([]),
  inclusions: Joi.array().items(Joi.string().trim().max(160)).max(30).default([]),
  exclusions: Joi.array().items(Joi.string().trim().max(160)).max(30).default([]),
  meetingPoint: Joi.string().trim().max(300).allow(null, ''),
  mediaUrls: Joi.array().items(Joi.string().uri()).max(20).default([]),
  timezone: Joi.string().trim().max(80).default('UTC'),
}).options({ abortEarly: false, stripUnknown: true });

router.get('/', async (req, res, next) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });

    const where: any = { status: 'PUBLISHED' };
    if (value.cityId) where.cityId = value.cityId;
    if (value.category) where.category = value.category;
    if (value.type) where.type = value.type;
    if (value.minPrice !== undefined || value.maxPrice !== undefined) {
      where.priceMinor = {};
      if (value.minPrice !== undefined) where.priceMinor.gte = value.minPrice;
      if (value.maxPrice !== undefined) where.priceMinor.lte = value.maxPrice;
    }
    if (value.language) where.languages = { has: value.language };
    if (value.interest) where.interests = { has: value.interest };

    const skip = (value.page - 1) * value.limit;
    const [items, total] = await prisma.$transaction([
      prisma.experience.findMany({
        where,
        skip,
        take: value.limit,
        orderBy: { createdAt: 'desc' },
        include: { city: true, companion: { include: { profile: true } } },
      }),
      prisma.experience.count({ where }),
    ]);

    res.json({ success: true, data: { items, pagination: { page: value.page, limit: value.limit, total, pages: Math.ceil(total / value.limit) } } });
  } catch (error) { next(error); }
});

router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const key = req.params.idOrSlug;
    const experience = await prisma.experience.findFirst({
      where: { status: 'PUBLISHED', OR: [{ id: key }, { slug: key }] },
      include: { city: true, companion: { include: { profile: true } } },
    });
    if (!experience) return res.status(404).json({ success: false, error: { code: 'EXPERIENCE_NOT_FOUND' } });
    res.json({ success: true, data: experience });
  } catch (error) { next(error); }
});

router.post('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    if (!req.customer?.roles.includes('COMPANION')) {
      return res.status(403).json({ success: false, error: { code: 'COMPANION_ROLE_REQUIRED' } });
    }
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });

    const existing = await prisma.experience.findUnique({ where: { slug: value.slug } });
    if (existing) return res.status(409).json({ success: false, error: { code: 'SLUG_ALREADY_EXISTS' } });

    const experience = await prisma.experience.create({ data: { ...value, cityId: value.cityId || null, companionId: req.customer.id, status: 'DRAFT' } });
    res.status(201).json({ success: true, data: experience });
  } catch (error) { next(error); }
});

export default router;
