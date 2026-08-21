import { Router } from 'express';
import Joi from 'joi';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();
const addSchema = Joi.object({ userId: Joi.string().required() });

router.get('/:tripId', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, OR: [{ ownerId: req.customer!.id }, { members: { some: { userId: req.customer!.id } } }] } });
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND' } });
    const members = await prisma.tripMember.findMany({ where: { tripId: trip.id }, include: { user: { include: { profile: true } } }, orderBy: { joinedAt: 'asc' } });
    res.json({ success: true, data: members });
  } catch (error) { next(error); }
});

router.post('/:tripId', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { error, value } = addSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details.map((d) => d.message) } });
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, ownerId: req.customer!.id } });
    if (!trip) return res.status(403).json({ success: false, error: { code: 'OWNER_REQUIRED' } });
    if (value.userId === req.customer!.id) return res.status(400).json({ success: false, error: { code: 'ALREADY_OWNER' } });
    const user = await prisma.user.findUnique({ where: { id: value.userId } });
    if (!user || user.status !== 'ACTIVE') return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND' } });
    const member = await prisma.tripMember.create({ data: { tripId: trip.id, userId: value.userId } });
    res.status(201).json({ success: true, data: member });
  } catch (error) { next(error); }
});

router.delete('/:tripId/:userId', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, ownerId: req.customer!.id } });
    if (!trip) return res.status(403).json({ success: false, error: { code: 'OWNER_REQUIRED' } });
    await prisma.tripMember.deleteMany({ where: { tripId: trip.id, userId: req.params.userId } });
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
