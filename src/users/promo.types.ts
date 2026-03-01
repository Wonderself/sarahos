export type PromoEffectType = 'tier_upgrade' | 'extend_demo' | 'bonus_calls';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  effectType: PromoEffectType;
  effectValue: string; // e.g. "free", "30" (days), "500" (calls)
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdBy: string;
  createdAt: Date;
}

export interface PromoRedemption {
  id: string;
  promoCodeId: string;
  userId: string;
  redeemedAt: Date;
}

export interface CreatePromoInput {
  code: string;
  description?: string;
  effectType: PromoEffectType;
  effectValue: string;
  maxUses?: number;
  expiresAt?: Date;
  createdBy: string;
}
