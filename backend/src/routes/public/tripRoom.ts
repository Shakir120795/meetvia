import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();
const messageSchema = Joi.object({
  body: Joi.string().trim().min(1).max(2000).required(),
});

async function memberTrip(tripId: string, userId: string) {
  return prisma.trip.findFirst({
    where: { id: tripId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
  });
}

router.get('/:tripId/messages', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await memberTrip(req.params.tripId, req.customer!.id);
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND' } });
    const messages = await prisma.tripMessage.findMany({
      where: { tripId: trip.id },
      include: { sender: { include: { profile: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
});

router.post('/:tripId/messages', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await memberTrip(req.params.tripId, req.customer!.id);
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND' } });
    const { error, value } = messageSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });
    const message = await prisma.tripMessage.create({ data: { tripId: trip.id, senderId: req.customer!.id, body: value.body } });
    res.status(201).json({ success: true, data: message });
  } catch (error) { next(error); }
});

export default router;
