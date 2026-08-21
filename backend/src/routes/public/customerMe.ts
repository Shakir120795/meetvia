import { Router } from 'express';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();

const optionalString = (value: unknown, maxLength: number) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') throw new Error('INVALID_PROFILE_FIELD');
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new Error('PROFILE_FIELD_TOO_LONG');
  return trimmed || null;
};

router.get('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.customer!.id },
      include: { profile: true, roles: { include: { role: true } } },
    });

    if (!user) return res.status(404).json({ success: false, error: { message: 'Customer not found' } });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        status: user.status,
        profile: user.profile,
        roles: user.roles.map((assignment) => assignment.role.name),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/', requireCustomerAuth, async (req: CustomerAuthRequest, res, next) => {
  try {
    const body = req.body || {};
    const allowed = ['firstName', 'lastName', 'displayName', 'avatarUrl', 'bio', 'countryCode', 'preferredLanguage', 'preferredCurrency'];
    const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
    if (unknown.length) return res.status(400).json({ success: false, error: { code: 'INVALID_PROFILE_FIELDS', fields: unknown } });

    const profileData = {
      firstName: optionalString(body.firstName, 80),
      lastName: optionalString(body.lastName, 80),
      displayName: optionalString(body.displayName, 120),
      avatarUrl: optionalString(body.avatarUrl, 500),
      bio: optionalString(body.bio, 500),
      countryCode: optionalString(body.countryCode, 8),
      preferredLanguage: optionalString(body.preferredLanguage, 16),
      preferredCurrency: optionalString(body.preferredCurrency, 8),
    };

    const existing = await prisma.userProfile.findUnique({ where: { userId: req.customer!.id } });
    const profile = existing
      ? await prisma.userProfile.update({ where: { userId: req.customer!.id }, data: profileData })
      : await prisma.userProfile.create({ where: undefined as never, data: { userId: req.customer!.id, ...profileData } });

    return res.json({ success: true, data: { profile } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update profile';
    if (message === 'INVALID_PROFILE_FIELD' || message === 'PROFILE_FIELD_TOO_LONG') {
      return res.status(400).json({ success: false, error: { code: message } });
    }
    next(error);
  }
});

export default router;
