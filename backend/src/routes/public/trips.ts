import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();
const createSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).required(),
  destination: Joi.string().trim().min(2).max(160).required(),
  countryCode: Joi.string().trim().uppercase().length(2).required(),
  startAt: Joi.date().iso().required(),
  endAt: Joi.date().iso().greater(Joi.ref('startAt')).required(),
  budgetMinor: Joi.number().integer().min(0).allow(null),
  currency: Joi.string().trim().uppercase().length(3).default('INR'),
  travelStyle: Joi.string().trim().max(80).allow(''),
  interests: Joi.array().items(Joi.string().trim().max(60)).max(30).default([]),
  languages: Joi.array().items(Joi.string().trim().max(20)).max(20).default([]),
  notes: Joi.string().trim().max(2000).allow(''),
});

router.post('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });
    const trip = await prisma.trip.create({ data: { ownerId: req.customer!.id, title: value.title, destination: value.destination, countryCode: value.countryCode, startAt: new Date(value.startAt), endAt: new Date(value.endAt), budgetMinor: value.budgetMinor ?? undefined, currency: value.currency, travelStyle: value.travelStyle || undefined, interests: value.interests, languages: value.languages, notes: value.notes || undefined, members: { create: { userId: req.customer!.id, role: 'OWNER' } } }, include: { members: true } });
    res.status(201).json({ success: true, data: trip });
  } catch (error) { next(error); }
});

router.get('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trips = await prisma.trip.findMany({ where: { members: { some: { userId: req.customer!.id } } }, include: { members: { include: { user: { include: { profile: true } } } } }, orderBy: { startAt: 'asc' } });
    res.json({ success: true, data: trips });
  } catch (error) { next(error); }
});

router.get('/:id', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, members: { some: { userId: req.customer!.id } } }, include: { members: { include: { user: { include: { profile: true } } } }, itinerary: { orderBy: { startAt: 'asc' } } } });
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND' } });
    res.json({ success: true, data: trip });
  } catch (error) { next(error); }
});

export default router;
