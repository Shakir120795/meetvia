export type CompanionTier = 'STARTER' | 'VERIFIED' | 'ELITE';

export interface CompanionTierProfile {
  tier: CompanionTier;
  verified: boolean;
  completedBookings: number;
  rating: number;
  cancellationRate: number;
  responseRate: number;
}

export interface CompanionTierResult {
  tier: CompanionTier;
  commissionRate: number;
  benefits: string[];
  nextTier?: CompanionTier;
  progress: number;
}

const thresholds = {
  VERIFIED: { bookings: 10, rating: 4.2, response: 70, cancellation: 20 },
  ELITE: { bookings: 50, rating: 4.7, response: 90, cancellation: 10 },
};

export function calculateCompanionTier(profile: CompanionTierProfile): CompanionTierResult {
  let tier: CompanionTier = 'STARTER';
  if (profile.verified && profile.completedBookings >= thresholds.VERIFIED.bookings && profile.rating >= thresholds.VERIFIED.rating && profile.responseRate >= thresholds.VERIFIED.response && profile.cancellationRate <= thresholds.VERIFIED.cancellation) tier = 'VERIFIED';
  if (profile.verified && profile.completedBookings >= thresholds.ELITE.bookings && profile.rating >= thresholds.ELITE.rating && profile.responseRate >= thresholds.ELITE.response && profile.cancellationRate <= thresholds.ELITE.cancellation) tier = 'ELITE';

  const benefits = tier === 'ELITE'
    ? ['PRIORITY_DISCOVERY', 'LOWER_COMMISSION', 'PREMIUM_BADGE']
    : tier === 'VERIFIED'
      ? ['VERIFIED_BADGE', 'BETTER_DISCOVERY', 'STANDARD_COMMISSION']
      : ['BASIC_DISCOVERY', 'STARTER_COMMISSION'];

  const commissionRate = tier === 'ELITE' ? 10 : tier === 'VERIFIED' ? 15 : 20;
  const nextTier = tier === 'STARTER' ? 'VERIFIED' : tier === 'VERIFIED' ? 'ELITE' : undefined;
  const target = nextTier === 'VERIFIED' ? thresholds.VERIFIED.bookings : nextTier === 'ELITE' ? thresholds.ELITE.bookings : thresholds.ELITE.bookings;
  const progress = Math.min(100, Math.round((profile.completedBookings / target) * 100));

  return { tier, commissionRate, benefits, nextTier, progress };
}
