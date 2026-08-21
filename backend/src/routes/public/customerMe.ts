import { Router } from 'express';
import prisma from '../../config/db';
import { CustomerAuthRequest, requireCustomerAuth } from '../../middleware/customerAuth';

const router = Router();

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

export default router;
