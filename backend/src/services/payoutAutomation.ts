export type PayoutStatus = 'PENDING' | 'ELIGIBLE' | 'PROCESSING' | 'PAID' | 'FAILED' | 'HELD';

export interface PayoutRequest {
  id: string;
  companionId: string;
  amountMinor: number;
  currency: string;
  status: PayoutStatus;
  createdAt: Date;
  availableAt: Date;
}

export interface PayoutDecision {
  eligible: boolean;
  status: PayoutStatus;
  reason?: string;
}

export function evaluatePayout(input: {
  request: PayoutRequest;
  verifiedCompanion: boolean;
  fraudRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  bookingCompleted: boolean;
  minimumPayoutMinor?: number;
  now?: Date;
}): PayoutDecision {
  const now = input.now || new Date();
  const minimum = input.minimumPayoutMinor ?? 1000;

  if (input.request.amountMinor < minimum) return { eligible: false, status: 'HELD', reason: 'MINIMUM_PAYOUT_NOT_MET' };
  if (!input.verifiedCompanion) return { eligible: false, status: 'HELD', reason: 'COMPANION_NOT_VERIFIED' };
  if (input.fraudRisk === 'HIGH') return { eligible: false, status: 'HELD', reason: 'HIGH_FRAUD_RISK' };
  if (!input.bookingCompleted) return { eligible: false, status: 'HELD', reason: 'BOOKING_NOT_COMPLETED' };
  if (now < input.request.availableAt) return { eligible: false, status: 'PENDING', reason: 'PAYOUT_HOLD_PERIOD' };
  if (input.request.status === 'PAID') return { eligible: false, status: 'PAID', reason: 'ALREADY_PAID' };

  return { eligible: true, status: 'ELIGIBLE' };
}
