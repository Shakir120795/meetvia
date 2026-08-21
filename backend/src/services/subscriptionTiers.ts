export type CompanionTier = 'FREE' | 'PRO' | 'PREMIUM';

export interface TierDefinition {
  tier: CompanionTier;
  monthlyPriceMinor: number;
  commissionRatePercent: number;
  benefits: string[];
}

export const COMPANION_TIERS: Record<CompanionTier, TierDefinition> = {
  FREE: {
    tier: 'FREE',
    monthlyPriceMinor: 0,
    commissionRatePercent: 20,
    benefits: ['Basic companion profile', 'Standard discovery'],
  },
  PRO: {
    tier: 'PRO',
    monthlyPriceMinor: 99900,
    commissionRatePercent: 15,
    benefits: ['Enhanced discovery', 'Priority profile placement'],
  },
  PREMIUM: {
    tier: 'PREMIUM',
    monthlyPriceMinor: 249900,
    commissionRatePercent: 10,
    benefits: ['Maximum discovery priority', 'Premium profile placement', 'Advanced analytics'],
  },
};

export function getCompanionTier(tier: string | null | undefined): TierDefinition {
  const normalized = (tier || 'FREE').toUpperCase() as CompanionTier;
  return COMPANION_TIERS[normalized] || COMPANION_TIERS.FREE;
}
