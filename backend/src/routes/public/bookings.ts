import { Router } from 'express';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();

router.post('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const { requestId } = req.body ?? {};
    if (typeof requestId !== 'string' || !requestId.trim()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'requestId is required' } });
    }

    const request = await prisma.companionRequest.findUnique({
      where: { id: requestId },
      include: { experience: true },
    });

    if (!request) return res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND' } });
    if (request.requesterId !== req.customer!.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    if (request.status !== 'ACCEPTED') return res.status(409).json({ success: false, error: { code: 'REQUEST_NOT_ACCEPTED', message: 'Only an accepted request can be booked' } });

    const existing = await prisma.booking.findUnique({ where: { requestId } });
    if (existing) return res.status(409).json({ success: false, error: { code: 'BOOKING_EXISTS', data: existing } });

    const overlapping = await prisma.booking.findFirst({
      where: {
        companionId: request.companionId,
        status: 'CONFIRMED',
        startAt: { lt: request.endAt ?? new Date(request.startAt.getTime() + 60 * 60 * 1000) },
        OR: [
          { endAt: null },
          { endAt: { gt: request.startAt } },
        ],
      },
    });
    if (overlapping) return res.status(409).json({ success: false, error: { code: 'TIME_SLOT_UNAVAILABLE' } });

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          requestId: request.id,
          customerId: request.requesterId,
          companionId: request.companionId,
          cityId: request.cityId,
          experienceId: request.experienceId,
          startAt: request.startAt,
          endAt: request.endAt,
          amountMinor: request.experience?.priceMinor ?? 0,
          currency: request.experience?.currency ?? 'INR',
          status: 'CONFIRMED',
        },
        include: { city: true, experience: true, request: true },
      });
      return created;
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
});

router.get('/mine', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { OR: [{ customerId: req.customer!.id }, { companionId: req.customer!.id }] },
      include: { city: true, experience: true, request: true },
      orderBy: { startAt: 'desc' },
    });
    res.json({ success: true, data: bookings });
  } catch (error) { next(error); }
});

router.patch('/:id/cancel', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND' } });
    if (booking.customerId !== req.customer!.id && booking.companionId !== req.customer!.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    if (booking.status !== 'CONFIRMED') return res.status(409).json({ success: false, error: { code: 'BOOKING_NOT_ACTIVE' } });

    const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });
    await prisma.companionRequest.update({ where: { id: booking.requestId }, data: { status: 'CANCELLED' } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

export default router;
