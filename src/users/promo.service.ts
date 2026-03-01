import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import type { PromoCode, PromoRedemption, CreatePromoInput } from './promo.types';
import type { AccountTier } from './user.types';

function rowToPromoCode(row: Record<string, unknown>): PromoCode {
  return {
    id: row['id'] as string,
    code: row['code'] as string,
    description: (row['description'] as string) ?? '',
    effectType: row['effect_type'] as PromoCode['effectType'],
    effectValue: row['effect_value'] as string,
    maxUses: row['max_uses'] as number,
    currentUses: row['current_uses'] as number,
    isActive: row['is_active'] as boolean,
    expiresAt: row['expires_at'] ? new Date(row['expires_at'] as string) : null,
    createdBy: row['created_by'] as string,
    createdAt: new Date(row['created_at'] as string),
  };
}

export class PromoService {
  async createCode(input: CreatePromoInput): Promise<PromoCode | null> {
    if (!dbClient.isConnected()) {
      logger.warn('PromoService.createCode: DB not connected');
      return null;
    }

    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO promo_codes (id, code, description, effect_type, effect_value, max_uses, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, input.code.toUpperCase(), input.description ?? '', input.effectType, input.effectValue, input.maxUses ?? 1, input.expiresAt ?? null, input.createdBy],
    );

    return result.rows[0] ? rowToPromoCode(result.rows[0] as Record<string, unknown>) : null;
  }

  async listCodes(activeOnly?: boolean): Promise<PromoCode[]> {
    if (!dbClient.isConnected()) return [];

    let query = 'SELECT * FROM promo_codes';
    const params: unknown[] = [];
    if (activeOnly) {
      query += ' WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())';
    }
    query += ' ORDER BY created_at DESC';

    const result = await dbClient.query(query, params);
    return result.rows.map((r) => rowToPromoCode(r as Record<string, unknown>));
  }

  async findByCode(code: string): Promise<PromoCode | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query('SELECT * FROM promo_codes WHERE code = $1', [code.toUpperCase()]);
    return result.rows[0] ? rowToPromoCode(result.rows[0] as Record<string, unknown>) : null;
  }

  async deactivateCode(code: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;

    const result = await dbClient.query('UPDATE promo_codes SET is_active = FALSE WHERE code = $1', [code.toUpperCase()]);
    return (result.rowCount ?? 0) > 0;
  }

  validateCode(promo: PromoCode): { valid: boolean; reason?: string } {
    if (!promo.isActive) {
      return { valid: false, reason: 'Promo code is no longer active' };
    }
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return { valid: false, reason: 'Promo code has expired' };
    }
    if (promo.currentUses >= promo.maxUses) {
      return { valid: false, reason: 'Promo code has reached maximum uses' };
    }
    return { valid: true };
  }

  async hasUserRedeemed(promoCodeId: string, userId: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;

    const result = await dbClient.query(
      'SELECT id FROM promo_redemptions WHERE promo_code_id = $1 AND user_id = $2',
      [promoCodeId, userId],
    );
    return (result.rows?.length ?? 0) > 0;
  }

  async redeemCode(code: string, userId: string): Promise<{ success: boolean; message: string; effect?: { type: string; value: string } }> {
    const promo = await this.findByCode(code);
    if (!promo) {
      return { success: false, message: 'Promo code not found' };
    }

    const validation = this.validateCode(promo);
    if (!validation.valid) {
      return { success: false, message: validation.reason! };
    }

    // Check duplicate redemption
    const alreadyRedeemed = await this.hasUserRedeemed(promo.id, userId);
    if (alreadyRedeemed) {
      return { success: false, message: 'You have already redeemed this code' };
    }

    // Apply effect
    const { userService } = await import('./user.service');
    const user = await userService.getUser(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    switch (promo.effectType) {
      case 'tier_upgrade': {
        const newTier = promo.effectValue as AccountTier;
        await userService.updateUser(userId, { tier: newTier });
        break;
      }
      case 'extend_demo': {
        const days = parseInt(promo.effectValue, 10);
        const baseDate = user.demoExpiresAt && user.demoExpiresAt > new Date() ? user.demoExpiresAt : new Date();
        const newExpiry = new Date(baseDate);
        newExpiry.setDate(newExpiry.getDate() + days);
        await userService.updateUser(userId, { demoExpiresAt: newExpiry, tier: 'demo' });
        break;
      }
      case 'bonus_calls': {
        const bonus = parseInt(promo.effectValue, 10);
        await userService.updateUser(userId, { dailyApiLimit: user.dailyApiLimit + bonus });
        break;
      }
    }

    // Record redemption
    await dbClient.query(
      'INSERT INTO promo_redemptions (id, promo_code_id, user_id) VALUES ($1, $2, $3)',
      [uuidv4(), promo.id, userId],
    );

    // Increment uses
    await dbClient.query('UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = $1', [promo.id]);

    // Update user's promo_code_used
    await dbClient.query('UPDATE users SET promo_code_used = $1 WHERE id = $2', [promo.code, userId]);

    logger.info('Promo code redeemed', { code: promo.code, userId, effect: promo.effectType, value: promo.effectValue });

    return {
      success: true,
      message: `Promo code ${promo.code} applied successfully`,
      effect: { type: promo.effectType, value: promo.effectValue },
    };
  }

  async getRedemptionsByUser(userId: string): Promise<PromoRedemption[]> {
    if (!dbClient.isConnected()) return [];

    const result = await dbClient.query(
      'SELECT * FROM promo_redemptions WHERE user_id = $1 ORDER BY redeemed_at DESC',
      [userId],
    );
    return result.rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: row['id'] as string,
        promoCodeId: row['promo_code_id'] as string,
        userId: row['user_id'] as string,
        redeemedAt: new Date(row['redeemed_at'] as string),
      };
    });
  }
}

export const promoService = new PromoService();
