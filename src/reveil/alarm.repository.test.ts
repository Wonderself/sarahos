jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockDbClient = {
  isConnected: jest.fn().mockReturnValue(true),
  query: jest.fn(),
};

jest.mock('../infra', () => ({
  dbClient: mockDbClient,
}));

import { alarmRepository } from './alarm.repository';

const now = new Date().toISOString();

/** Helper: build a raw DB row matching the user_alarms table shape. */
function makeRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'alarm-1',
    user_id: 'user-1',
    name: 'Mon reveil',
    is_active: true,
    alarm_time: '07:00',
    timezone: 'Europe/Paris',
    days_of_week: [1, 2, 3, 4, 5],
    mode: 'doux',
    rubrics: ['bonne_humeur'],
    voice: 'sarah',
    delivery_method: 'phone_call',
    phone_number: '+33600000000',
    custom_announcement: null,
    birth_date: null,
    last_triggered_at: null,
    last_trigger_status: 'pending',
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe('AlarmRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbClient.isConnected.mockReturnValue(true);
  });

  // ---- getByUserId ----

  describe('getByUserId', () => {
    it('should return alarms for a given user', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [makeRow(), makeRow({ id: 'alarm-2', name: 'Reveil 2' })],
      });

      const alarms = await alarmRepository.getByUserId('user-1');

      expect(alarms).toHaveLength(2);
      expect(alarms[0]!.id).toBe('alarm-1');
      expect(alarms[1]!.name).toBe('Reveil 2');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        ['user-1'],
      );
    });

    it('should return empty array when DB is disconnected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);

      const alarms = await alarmRepository.getByUserId('user-1');

      expect(alarms).toEqual([]);
      expect(mockDbClient.query).not.toHaveBeenCalled();
    });

    it('should return empty array on query error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('DB error'));

      const alarms = await alarmRepository.getByUserId('user-1');

      expect(alarms).toEqual([]);
    });
  });

  // ---- getById ----

  describe('getById', () => {
    it('should return a single alarm by ID', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [makeRow()] });

      const alarm = await alarmRepository.getById('alarm-1');

      expect(alarm).not.toBeNull();
      expect(alarm!.id).toBe('alarm-1');
      expect(alarm!.userId).toBe('user-1');
      expect(alarm!.mode).toBe('doux');
      expect(alarm!.daysOfWeek).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return null when alarm not found', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });

      const alarm = await alarmRepository.getById('nonexistent');

      expect(alarm).toBeNull();
    });

    it('should return null when DB is disconnected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);

      const alarm = await alarmRepository.getById('alarm-1');

      expect(alarm).toBeNull();
    });

    it('should return null on query error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('DB error'));

      const alarm = await alarmRepository.getById('alarm-1');

      expect(alarm).toBeNull();
    });
  });

  // ---- create ----

  describe('create', () => {
    it('should create an alarm with provided fields', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [makeRow({ id: 'new-alarm', mode: 'motivant' })],
      });

      const alarm = await alarmRepository.create('user-1', {
        name: 'Mon reveil',
        alarmTime: '07:00',
        mode: 'motivant',
        rubrics: ['bonne_humeur', 'meteo'],
        deliveryMethod: 'phone_call',
        phoneNumber: '+33600000000',
      });

      expect(alarm).not.toBeNull();
      expect(alarm!.id).toBe('new-alarm');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_alarms'),
        expect.arrayContaining(['user-1', 'Mon reveil']),
      );
    });

    it('should use default values when input is minimal', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [makeRow()] });

      const alarm = await alarmRepository.create('user-1', {});

      expect(alarm).not.toBeNull();
      // Verify the query received the default fallback values
      const queryArgs = mockDbClient.query.mock.calls[0]![1] as unknown[];
      expect(queryArgs).toContain('Mon reveil');     // default name
      expect(queryArgs).toContain('07:00');           // default time
      expect(queryArgs).toContain('Europe/Paris');    // default timezone
      expect(queryArgs).toContain('doux');            // default mode
      expect(queryArgs).toContain('sarah');           // default voice
      expect(queryArgs).toContain('phone_call');      // default delivery method
    });

    it('should return null when DB is disconnected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);

      const alarm = await alarmRepository.create('user-1', { name: 'Test' });

      expect(alarm).toBeNull();
    });

    it('should return null on query error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('Insert failed'));

      const alarm = await alarmRepository.create('user-1', { name: 'Test' });

      expect(alarm).toBeNull();
    });
  });

  // ---- update ----

  describe('update', () => {
    it('should update specified fields', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [makeRow({ name: 'Updated', mode: 'energique' })],
      });

      const alarm = await alarmRepository.update('alarm-1', 'user-1', {
        name: 'Updated',
        mode: 'energique',
      });

      expect(alarm).not.toBeNull();
      expect(alarm!.name).toBe('Updated');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_alarms SET'),
        expect.arrayContaining(['Updated', 'energique', 'alarm-1', 'user-1']),
      );
    });

    it('should handle isActive toggle', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [makeRow({ is_active: false })],
      });

      const alarm = await alarmRepository.update('alarm-1', 'user-1', { isActive: false });

      expect(alarm).not.toBeNull();
      expect(alarm!.isActive).toBe(false);
    });

    it('should return current alarm when no updateable fields provided', async () => {
      // When only updated_at would change, update() calls getById instead
      mockDbClient.query.mockResolvedValue({ rows: [makeRow()] });

      const alarm = await alarmRepository.update('alarm-1', 'user-1', {});

      expect(alarm).not.toBeNull();
      // getById is called, which queries SELECT * FROM user_alarms WHERE id = $1
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        ['alarm-1'],
      );
    });

    it('should return null when DB is disconnected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);

      const alarm = await alarmRepository.update('alarm-1', 'user-1', { name: 'X' });

      expect(alarm).toBeNull();
    });

    it('should return null on query error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('Update failed'));

      const alarm = await alarmRepository.update('alarm-1', 'user-1', { name: 'X' });

      expect(alarm).toBeNull();
    });

    it('should JSON.stringify rubrics for JSONB column', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [makeRow()] });

      await alarmRepository.update('alarm-1', 'user-1', { rubrics: ['meteo', 'news'] });

      const queryArgs = mockDbClient.query.mock.calls[0]![1] as unknown[];
      // The rubrics value should be a JSON string, not an array
      expect(queryArgs).toContain(JSON.stringify(['meteo', 'news']));
    });
  });

  // ---- delete ----

  describe('delete', () => {
    it('should delete an alarm and return true', async () => {
      mockDbClient.query.mockResolvedValue({ rowCount: 1 });

      const result = await alarmRepository.delete('alarm-1', 'user-1');

      expect(result).toBe(true);
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM user_alarms WHERE id = $1 AND user_id = $2'),
        ['alarm-1', 'user-1'],
      );
    });

    it('should return false when alarm not found', async () => {
      mockDbClient.query.mockResolvedValue({ rowCount: 0 });

      const result = await alarmRepository.delete('nonexistent', 'user-1');

      expect(result).toBe(false);
    });

    it('should return false when DB is disconnected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);

      const result = await alarmRepository.delete('alarm-1', 'user-1');

      expect(result).toBe(false);
    });

    it('should return false on query error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('Delete failed'));

      const result = await alarmRepository.delete('alarm-1', 'user-1');

      expect(result).toBe(false);
    });
  });

  // ---- getAlarmsToTrigger ----

  describe('getAlarmsToTrigger', () => {
    it('should return active alarms matching time and day', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [
          makeRow({ id: 'alarm-a' }),
          makeRow({ id: 'alarm-b', name: 'Second alarm' }),
        ],
      });

      const alarms = await alarmRepository.getAlarmsToTrigger('07:00', 1);

      expect(alarms).toHaveLength(2);
      expect(alarms[0]!.id).toBe('alarm-a');
      expect(alarms[1]!.id).toBe('alarm-b');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('is_active = true'),
        ['07:00', 1],
      );
    });

    it('should return empty array when no alarms match', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });

      const alarms = await alarmRepository.getAlarmsToTrigger('03:00', 6);

      expect(alarms).toEqual([]);
    });

    it('should return empty array when DB is disconnected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);

      const alarms = await alarmRepository.getAlarmsToTrigger('07:00', 1);

      expect(alarms).toEqual([]);
    });

    it('should return empty array on query error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('Query error'));

      const alarms = await alarmRepository.getAlarmsToTrigger('07:00', 1);

      expect(alarms).toEqual([]);
    });
  });

  // ---- updateTriggerStatus ----

  describe('updateTriggerStatus', () => {
    it('should update status and last_triggered_at', async () => {
      mockDbClient.query.mockResolvedValue({ rowCount: 1 });

      await alarmRepository.updateTriggerStatus('alarm-1', 'delivered');

      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('last_triggered_at = NOW()'),
        ['delivered', 'alarm-1'],
      );
    });

    it('should not throw when DB is disconnected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);

      await expect(alarmRepository.updateTriggerStatus('alarm-1', 'failed')).resolves.toBeUndefined();
      expect(mockDbClient.query).not.toHaveBeenCalled();
    });

    it('should not throw on query error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('Update failed'));

      await expect(alarmRepository.updateTriggerStatus('alarm-1', 'failed')).resolves.toBeUndefined();
    });
  });
});
