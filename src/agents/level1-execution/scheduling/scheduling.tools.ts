import { logger } from '../../../utils/logger';

export interface CreateEventResult {
  success: boolean;
  eventId: string;
  calendarLink: string;
}

export interface CheckConflictsResult {
  hasConflicts: boolean;
  conflicts: Array<{ title: string; time: string; attendees: string[] }>;
}

export interface SyncCalendarsResult {
  success: boolean;
  eventsSynced: number;
  conflicts: string[];
}

export interface ConvertTimezoneResult {
  converted: string;
  fromTz: string;
  toTz: string;
  offsetHours: number;
}

const ISRAEL_TIMEZONES = ['IST', 'IDT', 'Asia/Jerusalem', 'Israel'];
const FRANCE_TZ = 'Europe/Paris';

export async function createEvent(
  title: string,
  startTime: string,
  endTime: string,
  attendees: string[],
  timezone?: string
): Promise<CreateEventResult> {
  // Stub — real Google Calendar integration in later phase
  const tz = maskTimezone(timezone);
  logger.info('Event created (stub)', { title, startTime, endTime, timezone: tz, attendees: attendees.length });
  return {
    success: true,
    eventId: `evt_${Date.now()}`,
    calendarLink: `https://calendar.google.com/event/${Date.now()}`,
  };
}

export async function checkConflicts(
  startTime: string,
  endTime: string,
  attendees: string[]
): Promise<CheckConflictsResult> {
  // Stub — real conflict checking in later phase
  logger.info('Conflict check (stub)', { startTime, endTime, attendees: attendees.length });
  return {
    hasConflicts: false,
    conflicts: [],
  };
}

export async function syncCalendars(
  sources: string[]
): Promise<SyncCalendarsResult> {
  // Stub — real calendar sync in later phase
  logger.info('Calendar sync (stub)', { sources: sources.length });
  return {
    success: true,
    eventsSynced: 0,
    conflicts: [],
  };
}

export function convertTimezone(
  time: string,
  from: string,
  to: string
): ConvertTimezoneResult {
  // Mask Israel timezone
  const effectiveTo = ISRAEL_TIMEZONES.includes(from) ? FRANCE_TZ : to;

  // Stub — real timezone conversion in later phase
  const offsetMap: Record<string, number> = {
    'UTC': 0, 'CET': 1, 'CEST': 2, 'IST': 2, 'IDT': 3,
    'EST': -5, 'PST': -8, 'Europe/Paris': 1, 'Asia/Jerusalem': 2,
  };

  const fromOffset = offsetMap[from] ?? 0;
  const toOffset = offsetMap[effectiveTo] ?? 0;

  return {
    converted: time,
    fromTz: from,
    toTz: effectiveTo,
    offsetHours: toOffset - fromOffset,
  };
}

function maskTimezone(tz?: string): string {
  if (!tz) return FRANCE_TZ;
  return ISRAEL_TIMEZONES.includes(tz) ? FRANCE_TZ : tz;
}
