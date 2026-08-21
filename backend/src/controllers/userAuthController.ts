import { randomBytes } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import env from '../config/env';
import { generateOtp, hashOtp, normalizeEmail, normalizeMobile } from '../utils/userOtp';

type OtpPurpose = 'LOGIN' | 'SIGNUP' | 'VERIFY_EMAIL' | 'VERIFY_MOBILE';

const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function createSessionToken() {
  const token = randomBytes(32).toString('hex');
  return { token, tokenHash: hashOtp(token) };
}

async function deliverOtp(target: string, code: string): Promise<void> {
  // Delivery providers are intentionally isolated from authentication state.
  // Until an SMS/email provider is configured, development prints the OTP only.
  if (env.NODE_ENV !== 'production') {
    console.log(`[USER OTP] ${target}: ${code}`);
    return;
  }

  throw new Error('OTP delivery provider is not configured');
}

export async function requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email: rawEmail, mobile: rawMobile, purpose } = req.body as {
      email?: string;
      mobile?: string;
      purpose: OtpPurpose;
    };

    const email = rawEmail ? normalizeEmail(rawEmail) : undefined;
    const mobile = rawMobile ? normalizeMobile(rawMobile) : undefined;
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    const recent = await prisma.otpRequest.findFirst({
      where: {
        purpose,
        ...(email ? { email } : { mobile }),
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recent) {
      res.status(429).json({
        success: false,
        error: { message: 'Please wait before requesting another code' },
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: email ? { email } : { mobile },
    });

    await prisma.otpRequest.create({
      data: {
        userId: user?.id,
        email,
        mobile,
        purpose,
        codeHash: hashOtp(code),
        expiresAt,
      },
    });

    await deliverOtp(email || mobile!, code);

    res.status(200).json({
      success: true,
      data: { expiresAt: expiresAt.toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email: rawEmail, mobile: rawMobile, purpose, code } = req.body as {
      email?: string;
      mobile?: string;
      purpose: OtpPurpose;
      code: string;
    };

    const email = rawEmail ? normalizeEmail(rawEmail) : undefined;
    const mobile = rawMobile ? normalizeMobile(rawMobile) : undefined;

    const otp = await prisma.otpRequest.findFirst({
      where: {
        purpose,
        ...(email ? { email } : { mobile }),
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.expiresAt <= new Date() || otp.attempts >= 5 || otp.codeHash !== hashOtp(code)) {
      if (otp && otp.attempts < 5) {
        await prisma.otpRequest.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      }
      res.status(401).json({ success: false, error: { message: 'Invalid or expired verification code' } });
      return;
    }

    const now = new Date();
    const session = createSessionToken();

    const user = await prisma.$transaction(async (tx) => {
      let currentUser = await tx.user.findFirst({ where: email ? { email } : { mobile } });

      if (!currentUser) {
        currentUser = await tx.user.create({
          data: {
            email,
            mobile,
            profile: { create: {} },
          },
        });
      }

      if (email && (purpose === 'LOGIN' || purpose === 'SIGNUP' || purpose === 'VERIFY_EMAIL')) {
        await tx.user.update({ where: { id: currentUser.id }, data: { emailVerifiedAt: now } });
      }

      if (mobile && (purpose === 'LOGIN' || purpose === 'SIGNUP' || purpose === 'VERIFY_MOBILE')) {
        await tx.user.update({ where: { id: currentUser.id }, data: { mobileVerifiedAt: now } });
      }

      const role = await tx.role.upsert({
        where: { name: 'CUSTOMER' },
        update: {},
        create: { name: 'CUSTOMER', description: 'Default customer role' },
      });

      await tx.userRoleAssignment.upsert({
        where: { userId_roleId: { userId: currentUser.id, roleId: role.id } },
        update: {},
        create: { userId: currentUser.id, roleId: role.id },
      });

      await tx.session.create({
        data: {
          userId: currentUser.id,
          tokenHash: session.tokenHash,
          expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
          lastSeenAt: now,
        },
      });

      await tx.otpRequest.update({ where: { id: otp.id }, data: { consumedAt: now } });
      return currentUser;
    });

    res.status(200).json({
      success: true,
      data: {
        token: session.token,
        expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
        user: { id: user.id, email: user.email, mobile: user.mobile, status: user.status },
      },
    });
  } catch (error) {
    next(error);
  }
}
