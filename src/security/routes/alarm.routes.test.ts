jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/config', () => ({
  config: {
    JWT_SECRET: 'test-secret-at-least-16-chars',
    JWT_EXPIRES_IN: '1h',
    API_KEYS_ADMIN: 'admin-key',
    API_KEYS_OPERATOR: '',
    API_KEYS_VIEWER: '',
    API_KEYS_SYSTEM: '',
  },
}));

const mockAlarmService = {
  listAlarms: jest.fn(),
  createAlarm: jest.fn(),
  getAlarm: jest.fn(),
  updateAlarm: jest.fn(),
  deleteAlarm: jest.fn(),
  testAlarm: jest.fn(),
};

jest.mock('../../reveil/alarm.service', () => ({
  alarmService: mockAlarmService,
}));

import express from 'express';
import request from 'supertest';
import { AuthService } from '../auth.service';
import { createAlarmRouter } from './alarm.routes';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(createAlarmRouter());
  return app;
}

const authService = new AuthService();

function userToken(): string {
  return authService.generateToken('test@test.com', 'admin', { userId: 'test-user-id', tier: 'paid' as never });
}

const sampleAlarm = {
  id: 'a0000000-0000-4000-8000-000000000001',
  userId: 'test-user-id',
  name: 'Mon reveil du matin',
  mode: 'doux',
  alarmTime: '07:30',
  timezone: 'Europe/Paris',
  daysOfWeek: [1, 2, 3, 4, 5],
  isActive: true,
  phoneNumber: '+33612345678',
  deliveryMethod: 'whatsapp_message',
  rubrics: ['meteo', 'citation'],
  birthDate: null,
  customAnnouncement: null,
  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-01'),
};

describe('Alarm Routes', () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /portal/alarms', () => {
    it('should return user alarms (200)', async () => {
      mockAlarmService.listAlarms.mockResolvedValue([sampleAlarm]);

      const res = await request(app)
        .get('/portal/alarms')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.alarms).toHaveLength(1);
      expect(res.body.alarms[0].id).toBe(sampleAlarm.id);
      expect(mockAlarmService.listAlarms).toHaveBeenCalledWith('test-user-id');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/portal/alarms');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /portal/alarms', () => {
    it('should create alarm (201)', async () => {
      mockAlarmService.createAlarm.mockResolvedValue(sampleAlarm);

      const res = await request(app)
        .post('/portal/alarms')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({
          label: 'Mon reveil du matin',
          mode: 'doux',
          hour: 7,
          minute: 30,
          days: [1, 2, 3, 4, 5],
        });

      expect(res.status).toBe(201);
      expect(res.body.alarm).toBeDefined();
      expect(res.body.alarm.id).toBe(sampleAlarm.id);
      expect(mockAlarmService.createAlarm).toHaveBeenCalledWith('test-user-id', expect.any(Object));
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/portal/alarms')
        .send({ label: 'Test alarm' });

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /portal/alarms/:id', () => {
    it('should update alarm (200)', async () => {
      const updatedAlarm = { ...sampleAlarm, label: 'Reveil modifie' };
      mockAlarmService.updateAlarm.mockResolvedValue(updatedAlarm);

      const res = await request(app)
        .patch(`/portal/alarms/${sampleAlarm.id}`)
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ label: 'Reveil modifie' });

      expect(res.status).toBe(200);
      expect(res.body.alarm.label).toBe('Reveil modifie');
      expect(mockAlarmService.updateAlarm).toHaveBeenCalledWith(
        sampleAlarm.id,
        'test-user-id',
        expect.objectContaining({ label: 'Reveil modifie' }),
      );
    });

    it('should return 404 when alarm not found', async () => {
      mockAlarmService.updateAlarm.mockResolvedValue(null);

      const res = await request(app)
        .patch('/portal/alarms/nonexistent-id')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ label: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Alarm not found');
    });
  });

  describe('DELETE /portal/alarms/:id', () => {
    it('should delete alarm and return success', async () => {
      mockAlarmService.deleteAlarm.mockResolvedValue(true);

      const res = await request(app)
        .delete(`/portal/alarms/${sampleAlarm.id}`)
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockAlarmService.deleteAlarm).toHaveBeenCalledWith(sampleAlarm.id, 'test-user-id');
    });

    it('should return 404 when alarm not found', async () => {
      mockAlarmService.deleteAlarm.mockResolvedValue(false);

      const res = await request(app)
        .delete('/portal/alarms/nonexistent-id')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Alarm not found');
    });
  });

  describe('POST /portal/alarms/:id/test', () => {
    it('should trigger test and return result (200)', async () => {
      mockAlarmService.testAlarm.mockResolvedValue({
        content: 'Bonjour, il est l\'heure de se reveiller!',
        delivered: true,
      });

      const res = await request(app)
        .post(`/portal/alarms/${sampleAlarm.id}/test`)
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Bonjour, il est l\'heure de se reveiller!');
      expect(res.body.delivered).toBe(true);
      expect(mockAlarmService.testAlarm).toHaveBeenCalledWith(sampleAlarm.id, 'test-user-id');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post(`/portal/alarms/${sampleAlarm.id}/test`);

      expect(res.status).toBe(401);
    });
  });
});
