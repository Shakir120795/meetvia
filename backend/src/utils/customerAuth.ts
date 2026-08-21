import crypto from 'crypto';
import prisma from '../config/db';

const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export type OtpChannel = 'mobile' | 'email';

function hash(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeIdentifier(channel: OtpChannel, value: string) {
  return channel === 'email' ? value.trim().toLowerCase() : value.replace(/\D/g, '');
}

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function requestCustomerOtp(channel: OtpChannel, rawIdentifier: string, purpose = 'login') {
  const identifier = normalizeIdentifier(channel, rawIdentifier);
  const now = new Date();
  const code = generateOtp();

  const user = await prisma.user.findFirst({
    where: channel === 'email' ? { email: identifier } : { mobile: identifier },
  });

  const otp = await prisma.otpRequest.create({
    data: {
      userId: user?.id,
      mobile: channel === 'mobile' ? identifier : undefined,
      email: channel === 'email' ? identifier : undefined,
      purpose,
      codeHash: hash(code),
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    },
  });

  return { requestId: otp.id, code, expiresAt: otp.expiresAt };
}

export async function verifyCustomerOtp(
  requestId: string,
  rawCode: string,
) {
  const otp = await prisma.otpRequest.findUnique({ where: { id: requestId } });
  if (!otp || otp.consumedAt || otp.expiresAt <= new Date()) {
    throw new Error('OTP_EXPIRED_OR_INVALID');
  }
  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error('OTP_ATTEMPTS_EXCEEDED');
  }

  const valid = hash(rawCode.trim()) === otp.codeHash;
  if (!valid) {
    await prisma.otpRequest.update({
      where: { id: requestId },
      data: { attempts: { increment: 1 } },
    });
    throw new Error('OTP_INVALID');
  }

  const identifier = otp.mobile || otp.email;
  if (!identifier) throw new Error('OTP_INVALID');

  const user = await prisma.user.upsert({
    where: otp.mobile ? { mobile: identifier } : { email: identifier },
    create: otp.mobile ? { mobile: identifier } : { email: identifier },
    update: {},
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    create: { name: 'CUSTOMER', description: 'Customer / traveler account' },
    update: {},
  });

  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId: { userId: user.id, roleId: customerRole.id } },
    create: { userId: user.id, roleId: customerRole.id },
    update: {},
  });

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: otp.mobile ? { mobileVerifiedAt: new Date() } : { emailVerifiedAt: new Date() },
  });

  await prisma.otpRequest.update({
    where: { id: requestId },
    data: { consumedAt: new Date(), userId: user.id },
  });

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hash(sessionToken),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      lastSeenAt: new Date(),
    },
  });

  return { user: updatedUser, sessionToken, expiresAt: session.expiresAt };
}

export async function revokeCustomerSession(sessionToken: string) {
  await prisma.session.updateMany({
    where: { tokenHash: hash(sessionToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
