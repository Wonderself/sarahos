import { createTestApp, AuthService } from './setup';
import request from 'supertest';

const app = createTestApp();
const authService = new AuthService();

function adminToken(): string {
  return authService.generateToken('admin-user', 'admin', { userId: 'admin-1' });
}

function userToken(): string {
  return authService.generateToken('regular-user', 'viewer', { userId: 'user-1', tier: 'free' });
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { promoService } = require('../users/promo.service');

const samplePromo = {
  id: 'promo-1',
  code: 'WELCOME2024',
  description: 'Welcome offer',
  effectType: 'tier_upgrade',
  effectValue: 'free',
  maxUses: 100,
  currentUses: 5,
  isActive: true,
  expiresAt: null,
  createdBy: 'admin',
  createdAt: new Date(),
};

describe('Promo Code System (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /admin/promo-codes — admin can create promo code', async () => {
    promoService.createCode.mockResolvedValue(samplePromo);

    const res = await request(app)
      .post('/admin/promo-codes')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ code: 'WELCOME2024', effectType: 'tier_upgrade', effectValue: 'free', maxUses: 100 });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe('WELCOME2024');
  });

  it('POST /admin/promo-codes — viewer gets 403', async () => {
    const res = await request(app)
      .post('/admin/promo-codes')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ code: 'HACK', effectType: 'tier_upgrade', effectValue: 'paid', maxUses: 1 });

    expect(res.status).toBe(403);
  });

  it('GET /admin/promo-codes — admin can list codes', async () => {
    promoService.listCodes.mockResolvedValue([samplePromo]);

    const res = await request(app)
      .get('/admin/promo-codes')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.codes).toHaveLength(1);
  });

  it('DELETE /admin/promo-codes/:code — admin can deactivate', async () => {
    promoService.deactivateCode.mockResolvedValue(true);

    const res = await request(app)
      .delete('/admin/promo-codes/WELCOME2024')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('deactivated');
  });

  it('POST /promo/redeem — user can redeem code', async () => {
    promoService.redeemCode.mockResolvedValue({
      success: true,
      message: 'Promo code WELCOME2024 applied successfully',
      effect: { type: 'tier_upgrade', value: 'free' },
    });

    const res = await request(app)
      .post('/promo/redeem')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ code: 'WELCOME2024' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /promo/redeem — returns 400 for invalid code', async () => {
    promoService.redeemCode.mockResolvedValue({ success: false, message: 'Promo code not found' });

    const res = await request(app)
      .post('/promo/redeem')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ code: 'INVALID' });

    expect(res.status).toBe(400);
  });

  it('GET /promo/validate/:code — valid code', async () => {
    promoService.findByCode.mockResolvedValue(samplePromo);
    promoService.validateCode.mockReturnValue({ valid: true });

    const res = await request(app)
      .get('/promo/validate/WELCOME2024')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  it('GET /promo/validate/:code — unknown code', async () => {
    promoService.findByCode.mockResolvedValue(null);

    const res = await request(app)
      .get('/promo/validate/NOPE')
      .set('Authorization', `Bearer ${userToken()}`);

    expect(res.status).toBe(404);
    expect(res.body.valid).toBe(false);
  });
});
