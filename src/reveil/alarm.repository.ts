import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import type { UserAlarm, CreateAlarmInput, UpdateAlarmInput } from './alarm.types';

function rowToAlarm(row: Record<string, unknown>): UserAlarm {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    name: row['name'] as string,
    isActive: row['is_active'] as boolean,
    alarmTime: row['alarm_time'] as string,
    timezone: row['timezone'] as string,
    daysOfWeek: (row['days_of_week'] as number[]) ?? [],
    mode: row['mode'] as UserAlarm['mode'],
    rubrics: (row['rubrics'] as string[]) ?? [],
    voice: row['voice'] as string,
    deliveryMethod: row['delivery_method'] as UserAlarm['deliveryMethod'],
    phoneNumber: (row['phone_number'] as string) ?? null,
    customAnnouncement: (row['custom_announcement'] as string) ?? null,
    birthDate: (row['birth_date'] as string) ?? null,
    lastTriggeredAt: row['last_triggered_at'] ? new Date(row['last_triggered_at'] as string).toISOString() : null,
    lastTriggerStatus: (row['last_trigger_status'] as UserAlarm['lastTriggerStatus']) ?? 'pending',
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

class AlarmRepository {
  /**
   * List all alarms for a given user.
   */
  async getByUserId(userId: string): Promise<UserAlarm[]> {
    if (!dbClient.isConnected()) return [];

    try {
      const result = await dbClient.query(
        'SELECT * FROM user_alarms WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );
      return result.rows.map((row) => rowToAlarm(row as Record<string, unknown>));
    } catch (error) {
      logger.error('AlarmRepository.getByUserId failed', { userId, error });
      return [];
    }
  }

  /**
   * Get a single alarm by its ID.
   */
  async getById(id: string): Promise<UserAlarm | null> {
    if (!dbClient.isConnected()) return null;

    try {
      const result = await dbClient.query('SELECT * FROM user_alarms WHERE id = $1', [id]);
      return result.rows[0] ? rowToAlarm(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('AlarmRepository.getById failed', { id, error });
      return null;
    }
  }

  /**
   * Create a new alarm for a user.
   */
  async create(userId: string, input: CreateAlarmInput): Promise<UserAlarm | null> {
    if (!dbClient.isConnected()) return null;

    const id = uuidv4();
    try {
      const result = await dbClient.query(
        `INSERT INTO user_alarms (
          id, user_id, name, is_active, alarm_time, timezone, days_of_week,
          mode, rubrics, voice, delivery_method, phone_number,
          custom_announcement, birth_date, last_trigger_status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, true, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, 'pending', NOW(), NOW()
        ) RETURNING *`,
        [
          id,
          userId,
          input.name ?? 'Mon reveil',
          input.alarmTime ?? '07:00',
          input.timezone ?? 'Europe/Paris',
          input.daysOfWeek ?? [1, 2, 3, 4, 5],
          input.mode ?? 'doux',
          JSON.stringify(input.rubrics ?? ['bonne_humeur']),
          input.voice ?? 'sarah',
          input.deliveryMethod ?? 'phone_call',
          input.phoneNumber ?? null,
          input.customAnnouncement ?? null,
          input.birthDate ?? null,
        ],
      );
      return result.rows[0] ? rowToAlarm(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('AlarmRepository.create failed', { userId, error });
      return null;
    }
  }

  /**
   * Update an existing alarm with dynamic SET clause.
   * Only the provided fields are updated.
   */
  async update(id: string, userId: string, input: UpdateAlarmInput): Promise<UserAlarm | null> {
    if (!dbClient.isConnected()) return null;

    const fieldMap: Record<string, string> = {
      name: 'name',
      isActive: 'is_active',
      alarmTime: 'alarm_time',
      timezone: 'timezone',
      daysOfWeek: 'days_of_week',
      mode: 'mode',
      rubrics: 'rubrics',
      voice: 'voice',
      deliveryMethod: 'delivery_method',
      phoneNumber: 'phone_number',
      customAnnouncement: 'custom_announcement',
      birthDate: 'birth_date',
    };

    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const [key, value] of Object.entries(input)) {
      const col = fieldMap[key];
      if (!col) continue;
      setClauses.push(`${col} = $${paramIdx}`);
      // JSONB columns need JSON.stringify
      if (key === 'rubrics') {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
      paramIdx++;
    }

    if (setClauses.length === 1) {
      // Nothing to update besides updated_at
      return this.getById(id);
    }

    values.push(id);
    values.push(userId);

    try {
      const result = await dbClient.query(
        `UPDATE user_alarms SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND user_id = $${paramIdx + 1} RETURNING *`,
        values,
      );
      return result.rows[0] ? rowToAlarm(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('AlarmRepository.update failed', { id, userId, error });
      return null;
    }
  }

  /**
   * Delete an alarm belonging to a user.
   */
  async delete(id: string, userId: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;

    try {
      const result = await dbClient.query(
        'DELETE FROM user_alarms WHERE id = $1 AND user_id = $2',
        [id, userId],
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error('AlarmRepository.delete failed', { id, userId, error });
      return false;
    }
  }

  /**
   * Get all enabled alarms (for timezone-aware cron check in the service layer).
   */
  async getAllEnabled(): Promise<UserAlarm[]> {
    if (!dbClient.isConnected()) return [];

    try {
      const result = await dbClient.query(
        `SELECT * FROM user_alarms WHERE is_active = true ORDER BY created_at ASC`,
      );
      return result.rows.map((row) => rowToAlarm(row as Record<string, unknown>));
    } catch (error) {
      logger.error('AlarmRepository.getAllEnabled failed', { error });
      return [];
    }
  }

  /**
   * Find active alarms that should trigger at the given time and day of week.
   * Excludes alarms that have already been triggered today (last_triggered_at is today).
   */
  async getAlarmsToTrigger(currentTimeHHMM: string, currentDayOfWeek: number): Promise<UserAlarm[]> {
    if (!dbClient.isConnected()) return [];

    try {
      const result = await dbClient.query(
        `SELECT * FROM user_alarms
         WHERE is_active = true
           AND alarm_time = $1
           AND $2 = ANY(days_of_week)
           AND (
             last_triggered_at IS NULL
             OR last_triggered_at::date < CURRENT_DATE
           )
         ORDER BY created_at ASC`,
        [currentTimeHHMM, currentDayOfWeek],
      );
      return result.rows.map((row) => rowToAlarm(row as Record<string, unknown>));
    } catch (error) {
      logger.error('AlarmRepository.getAlarmsToTrigger failed', { currentTimeHHMM, currentDayOfWeek, error });
      return [];
    }
  }

  /**
   * Update the trigger status and timestamp after an alarm fires.
   */
  async updateTriggerStatus(id: string, status: string): Promise<void> {
    if (!dbClient.isConnected()) return;

    try {
      await dbClient.query(
        `UPDATE user_alarms SET last_triggered_at = NOW(), last_trigger_status = $1, updated_at = NOW() WHERE id = $2`,
        [status, id],
      );
    } catch (error) {
      logger.error('AlarmRepository.updateTriggerStatus failed', { id, status, error });
    }
  }
}

export const alarmRepository = new AlarmRepository();
