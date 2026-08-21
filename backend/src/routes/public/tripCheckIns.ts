import { Router } from 'express';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();

async function memberTrip(tripId: string, userId: string) {
  return prisma.trip.findFirst({ where: { id: tripId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] } });
}

router.post('/:tripId/check-in', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await memberTrip(req.params.tripId, req.customer!.id);
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND' } });
    const checkIn = await prisma.tripCheckIn.upsert({
      where: { tripId_userId: { tripId: trip.id, userId: req.customer!.id } },
      create: { tripId: trip.id, userId: req.customer!.id, checkedInAt: new Date() },
      update: { checkedInAt: new Date(), checkedOutAt: null },
    });
    res.json({ success: true, data: checkIn });
  } catch (error) { next(error); }
});

router.post('/:tripId/check-out', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await memberTrip(req.params.tripId, req.customer!.id);
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND' } });
    const checkIn = await prisma.tripCheckIn.findUnique({ where: { tripId_userId: { tripId: trip.id, userId: req.customer!.id } } });
    if (!checkIn || !checkIn.checkedInAt) return res.status(400).json({ success: false, error: { code: 'NOT_CHECKED_IN' } });
    const updated = await prisma.tripCheckIn.update({ where: { id: checkIn.id }, data: { checkedOutAt: new Date() } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

router.get('/:tripId', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const trip = await memberTrip(req.params.tripId, req.customer!.id);
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND' } });
    const checkIns = await prisma.tripCheckIn.findMany({ where: { tripId: trip.id }, include: { user: { include: { profile: true } } }, orderBy: { checkedInAt: 'desc' } });
    res.json({ success: true, data: checkIns });
  } catch (error) { next(error); }
});

export default router;
