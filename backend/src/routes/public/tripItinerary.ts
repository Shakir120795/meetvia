import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();

const schema = Joi.object({
  title: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().trim().max(2000).allow('', null),
  location: Joi.string().trim().max(240).allow('', null),
  startAt: Joi.date().iso().required(),
  endAt: Joi.date().iso().greater(Joi.ref('startAt')).required(),
  type: Joi.string().trim().max(50).allow('', null),
});

async function getTripAccess(tripId: string, userId: string) {
  return prisma.trip.findFirst({
    where: { id: tripId, members: { some: { userId } } },
  });
}

router.get('/:tripId', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await getTripAccess(req.params.tripId, req.customer!.id);
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND' } });
    const items = await prisma.itineraryItem.findMany({
      where: { tripId: trip.id },
      orderBy: { startAt: 'asc' },
    });
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});

router.post('/:tripId', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, ownerId: req.customer!.id } });
    if (!trip) return res.status(403).json({ success: false, error: { code: 'OWNER_REQUIRED' } });
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });
    const item = await prisma.itineraryItem.create({
      data: {
        tripId: trip.id,
        title: value.title,
        description: value.description || undefined,
        location: value.location || undefined,
        startAt: new Date(value.startAt),
        endAt: new Date(value.endAt),
        type: value.type || undefined,
      },
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.patch('/:tripId/:itemId', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, ownerId: req.customer!.id } });
    if (!trip) return res.status(403).json({ success: false, error: { code: 'OWNER_REQUIRED' } });
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });
    const item = await prisma.itineraryItem.updateMany({
      where: { id: req.params.itemId, tripId: trip.id },
      data: {
        title: value.title,
        description: value.description || undefined,
        location: value.location || undefined,
        startAt: new Date(value.startAt),
        endAt: new Date(value.endAt),
        type: value.type || undefined,
      },
    });
    if (!item.count) return res.status(404).json({ success: false, error: { code: 'ITINERARY_ITEM_NOT_FOUND' } });
    const updated = await prisma.itineraryItem.findUnique({ where: { id: req.params.itemId } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

router.delete('/:tripId/:itemId', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, ownerId: req.customer!.id } });
    if (!trip) return res.status(403).json({ success: false, error: { code: 'OWNER_REQUIRED' } });
    const deleted = await prisma.itineraryItem.deleteMany({ where: { id: req.params.itemId, tripId: trip.id } });
    if (!deleted.count) return res.status(404).json({ success: false, error: { code: 'ITINERARY_ITEM_NOT_FOUND' } });
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
