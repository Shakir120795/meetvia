import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();
const joinSchema = Joi.object({ tripId: Joi.string().required() });

router.post('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { error, value } = joinSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR' } });
    const trip = await prisma.trip.findUnique({ where: { id: value.tripId }, include: { members: true } });
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND' } });
    if (trip.members.some((m) => m.userId === req.customer!.id)) return res.status(409).json({ success: false, error: { code: 'ALREADY_MEMBER' } });
    const entry = await prisma.tripWaitlist.create({ data: { tripId: trip.id, userId: req.customer!.id } });
    res.status(201).json({ success: true, data: entry });
  } catch (error) { next(error); }
});

router.get('/mine', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const entries = await prisma.tripWaitlist.findMany({ where: { userId: req.customer!.id }, include: { trip: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: entries });
  } catch (error) { next(error); }
});

router.delete('/:tripId', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const deleted = await prisma.tripWaitlist.deleteMany({ where: { tripId: req.params.tripId, userId: req.customer!.id } });
    if (!deleted.count) return res.status(404).json({ success: false, error: { code: 'WAITLIST_ENTRY_NOT_FOUND' } });
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
