export type PromotionType = 'PERCENTAGE' | 'FIXED';

export interface Promotion {
  id: string;
  code: string;
  type: PromotionType;
  value: number;
  maxDiscountMinor?: number;
  minOrderMinor?: number;
  startsAt: Date;
  endsAt: Date;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
}

export interface PromotionResult {
  valid: boolean;
  discountMinor: number;
  finalAmountMinor: number;
  reason?: string;
}

export function applyPromotion(promotion: Promotion, amountMinor: number, now = new Date()): PromotionResult {
  if (!promotion.active) return { valid: false, discountMinor: 0, finalAmountMinor: amountMinor, reason: 'PROMOTION_INACTIVE' };
  if (now < promotion.startsAt || now > promotion.endsAt) return { valid: false, discountMinor: 0, finalAmountMinor: amountMinor, reason: 'PROMOTION_EXPIRED_OR_NOT_STARTED' };
  if (promotion.usageLimit !== undefined && promotion.usageCount >= promotion.usageLimit) return { valid: false, discountMinor: 0, finalAmountMinor: amountMinor, reason: 'PROMOTION_USAGE_LIMIT_REACHED' };
  if (promotion.minOrderMinor !== undefined && amountMinor < promotion.minOrderMinor) return { valid: false, discountMinor: 0, finalAmountMinor: amountMinor, reason: 'MINIMUM_ORDER_NOT_MET' };
  if (amountMinor <= 0) return { valid: false, discountMinor: 0, finalAmountMinor: amountMinor, reason: 'INVALID_ORDER_AMOUNT' };

  let discountMinor = promotion.type === 'PERCENTAGE'
    ? Math.floor(amountMinor * Math.min(100, Math.max(0, promotion.value)) / 100)
    : Math.max(0, Math.floor(promotion.value));

  if (promotion.maxDiscountMinor !== undefined) discountMinor = Math.min(discountMinor, Math.max(0, promotion.maxDiscountMinor));
  discountMinor = Math.min(discountMinor, amountMinor);

  return { valid: true, discountMinor, finalAmountMinor: amountMinor - discountMinor };
}
