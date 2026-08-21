export type ReferralStatus = 'PENDING' | 'QUALIFIED' | 'REWARDED' | 'REJECTED';

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  status: ReferralStatus;
  createdAt: Date;
  qualifiedAt?: Date;
  rewardedAt?: Date;
}

export interface ReferralReward {
  eligible: boolean;
  rewardMinor: number;
  currency: string;
  reason?: string;
}

const REWARD_MINOR = 500;
const CURRENCY = 'INR';

export function evaluateReferralReward(input: {
  referral: Referral;
  referredUserVerified: boolean;
  referredUserCompletedFirstBooking: boolean;
}): ReferralReward {
  if (input.referral.status === 'REWARDED') {
    return { eligible: false, rewardMinor: 0, currency: CURRENCY, reason: 'ALREADY_REWARDED' };
  }
  if (input.referral.status === 'REJECTED') {
    return { eligible: false, rewardMinor: 0, currency: CURRENCY, reason: 'REFERRAL_REJECTED' };
  }
  if (!input.referredUserVerified) {
    return { eligible: false, rewardMinor: 0, currency: CURRENCY, reason: 'VERIFICATION_REQUIRED' };
  }
  if (!input.referredUserCompletedFirstBooking) {
    return { eligible: false, rewardMinor: 0, currency: CURRENCY, reason: 'FIRST_BOOKING_REQUIRED' };
  }
  return { eligible: true, rewardMinor: REWARD_MINOR, currency: CURRENCY };
}
