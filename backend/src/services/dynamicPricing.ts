export interface PricingInput {
  baseAmountMinor: number;
  demand: number;
  availability: number;
  daysUntilStart: number;
  premiumTier: boolean;
}

export interface PricingResult {
  baseAmountMinor: number;
  multiplier: number;
  finalAmountMinor: number;
  factors: string[];
}

export function calculateDynamicPrice(input: PricingInput): PricingResult {
  const base = Math.max(0, Math.floor(input.baseAmountMinor));
  let multiplier = 1;
  const factors: string[] = [];

  const demand = Math.max(0, Math.min(100, input.demand));
  const availability = Math.max(0, Math.min(100, input.availability));
  const days = Math.max(0, input.daysUntilStart);

  if (demand >= 80) { multiplier += 0.15; factors.push('HIGH_DEMAND'); }
  else if (demand >= 60) { multiplier += 0.08; factors.push('ELEVATED_DEMAND'); }

  if (availability <= 20) { multiplier += 0.10; factors.push('LOW_AVAILABILITY'); }
  if (days <= 3) { multiplier += 0.05; factors.push('LAST_MINUTE'); }
  if (input.premiumTier) { multiplier -= 0.05; factors.push('PREMIUM_TIER_DISCOUNT'); }

  multiplier = Math.max(0.8, Math.min(1.35, multiplier));
  const finalAmountMinor = Math.max(0, Math.round(base * multiplier));
  return { baseAmountMinor: base, multiplier, finalAmountMinor, factors };
}
