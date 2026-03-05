import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';

export interface UserPreferences {
  id: string;
  userId: string;
  isPro: boolean;
  darkMode: boolean;
  compactMode: boolean;
  language: string;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyWhatsapp: boolean;
  notifyInApp: boolean;
  notifyLowBalance: boolean;
  notifyDailyReport: boolean;
  notifyWeeklyReport: boolean;
  defaultAgent: string;
  voiceEnabled: boolean;
  preferredVoice: string;
  companyProfile: Record<string, unknown>;
  gamificationData: Record<string, unknown>;
  teamData: unknown[];
  agentConfigs: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

function rowToPreferences(row: Record<string, unknown>): UserPreferences {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    isPro: (row['is_pro'] as boolean) ?? false,
    darkMode: row['dark_mode'] as boolean,
    compactMode: row['compact_mode'] as boolean,
    language: row['language'] as string,
    notifyEmail: row['notify_email'] as boolean,
    notifySms: row['notify_sms'] as boolean,
    notifyWhatsapp: row['notify_whatsapp'] as boolean,
    notifyInApp: row['notify_in_app'] as boolean,
    notifyLowBalance: row['notify_low_balance'] as boolean,
    notifyDailyReport: row['notify_daily_report'] as boolean,
    notifyWeeklyReport: row['notify_weekly_report'] as boolean,
    defaultAgent: row['default_agent'] as string,
    voiceEnabled: row['voice_enabled'] as boolean,
    preferredVoice: row['preferred_voice'] as string,
    companyProfile: (row['company_profile'] as Record<string, unknown>) ?? {},
    gamificationData: (row['gamification_data'] as Record<string, unknown>) ?? {},
    teamData: (row['team_data'] as unknown[]) ?? [],
    agentConfigs: (row['agent_configs'] as Record<string, unknown>) ?? {},
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

class UserPreferencesRepository {
  async getByUserId(userId: string): Promise<UserPreferences | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
    if (result.rows[0]) return rowToPreferences(result.rows[0] as Record<string, unknown>);

    // Auto-create defaults
    return this.createDefaults(userId);
  }

  private async createDefaults(userId: string): Promise<UserPreferences | null> {
    const id = uuidv4();
    try {
      const result = await dbClient.query(
        `INSERT INTO user_preferences (id, user_id) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
         RETURNING *`,
        [id, userId],
      );
      return result.rows[0] ? rowToPreferences(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('Failed to create default preferences', { userId, error });
      return null;
    }
  }

  async update(userId: string, updates: Partial<Record<string, unknown>>): Promise<UserPreferences | null> {
    if (!dbClient.isConnected()) return null;

    // Ensure preferences exist
    await this.getByUserId(userId);

    // Build dynamic SET clause
    const fieldMap: Record<string, string> = {
      isPro: 'is_pro',
      darkMode: 'dark_mode',
      compactMode: 'compact_mode',
      language: 'language',
      notifyEmail: 'notify_email',
      notifySms: 'notify_sms',
      notifyWhatsapp: 'notify_whatsapp',
      notifyInApp: 'notify_in_app',
      notifyLowBalance: 'notify_low_balance',
      notifyDailyReport: 'notify_daily_report',
      notifyWeeklyReport: 'notify_weekly_report',
      defaultAgent: 'default_agent',
      voiceEnabled: 'voice_enabled',
      preferredVoice: 'preferred_voice',
      companyProfile: 'company_profile',
      gamificationData: 'gamification_data',
      teamData: 'team_data',
      agentConfigs: 'agent_configs',
    };

    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const [key, value] of Object.entries(updates)) {
      const col = fieldMap[key];
      if (!col) continue;
      setClauses.push(`${col} = $${paramIdx}`);
      values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      paramIdx++;
    }

    values.push(userId);
    const result = await dbClient.query(
      `UPDATE user_preferences SET ${setClauses.join(', ')} WHERE user_id = $${paramIdx} RETURNING *`,
      values,
    );
    return result.rows[0] ? rowToPreferences(result.rows[0] as Record<string, unknown>) : null;
  }

  async getCompanyProfile(userId: string): Promise<Record<string, unknown>> {
    const prefs = await this.getByUserId(userId);
    return prefs?.companyProfile ?? {};
  }

  async updateCompanyProfile(userId: string, profile: Record<string, unknown>): Promise<UserPreferences | null> {
    return this.update(userId, { companyProfile: profile });
  }

  async getGamification(userId: string): Promise<Record<string, unknown>> {
    const prefs = await this.getByUserId(userId);
    return prefs?.gamificationData ?? {};
  }

  async updateGamification(userId: string, data: Record<string, unknown>): Promise<UserPreferences | null> {
    return this.update(userId, { gamificationData: data });
  }

  async resetGamification(userId: string): Promise<UserPreferences | null> {
    return this.update(userId, { gamificationData: { level: 1, xp: 0, streak: 0, achievements: [] } });
  }
}

export const userPreferencesRepository = new UserPreferencesRepository();
