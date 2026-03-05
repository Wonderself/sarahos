// ===============================================================
// Ceremonie Agent — Tools & Repository ("Maitre de Ceremonie")
// ===============================================================

import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../../../../infra';
import { logger } from '../../../../utils/logger';
import { TIMELINE_TEMPLATES } from './ceremonie.prompts';
import type {
  Event,
  EventType,
  EventStatus,
  Guest,
  RSVPStatus,
  RSVPSummary,
  TimelineMilestone,
  MenuItem,
} from './ceremonie.types';

// Re-export for convenience
export { TIMELINE_TEMPLATES as TIMELINE_TEMPLATE };

// ── Events (events_planner) ──

export async function getEvents(userId: string): Promise<Event[]> {
  if (!dbClient.isConnected()) return [];
  try {
    const result = await dbClient.query(
      `SELECT * FROM events_planner WHERE user_id = $1 ORDER BY event_date ASC`,
      [userId],
    );
    return result.rows.map((r) => rowToEvent(r as Record<string, unknown>));
  } catch (err) {
    logger.error('Failed to get events', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

export async function createEvent(
  userId: string,
  data: {
    eventType: EventType;
    title: string;
    eventDate: string;
    venue?: string | null;
    budgetCents?: number;
    guestCount?: number;
    status?: EventStatus;
    timeline?: TimelineMilestone[];
    menu?: MenuItem[];
  },
): Promise<Event | null> {
  if (!dbClient.isConnected()) return null;
  const id = uuidv4();

  // Use default timeline template if not provided
  const timeline = data.timeline ?? TIMELINE_TEMPLATES[data.eventType] ?? TIMELINE_TEMPLATES.autre;

  try {
    const result = await dbClient.query(
      `INSERT INTO events_planner
       (id, user_id, event_type, title, event_date, venue, budget_cents,
        spent_cents, guest_count, status, timeline, menu)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        id, userId, data.eventType, data.title, data.eventDate,
        data.venue ?? null, data.budgetCents ?? 0, 0,
        data.guestCount ?? 0, data.status ?? 'draft',
        JSON.stringify(timeline), JSON.stringify(data.menu ?? []),
      ],
    );
    return rowToEvent(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to create event', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function updateEvent(
  eventId: string,
  userId: string,
  data: Partial<{
    title: string;
    eventDate: string;
    venue: string | null;
    budgetCents: number;
    spentCents: number;
    guestCount: number;
    status: EventStatus;
    timeline: TimelineMilestone[];
    menu: MenuItem[];
  }>,
): Promise<Event | null> {
  if (!dbClient.isConnected()) return null;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const directFields: Array<[string, unknown]> = [
    ['title', data.title],
    ['event_date', data.eventDate],
    ['venue', data.venue],
    ['budget_cents', data.budgetCents],
    ['spent_cents', data.spentCents],
    ['guest_count', data.guestCount],
    ['status', data.status],
  ];

  for (const [col, val] of directFields) {
    if (val !== undefined) {
      fields.push(`${col} = $${idx++}`);
      values.push(val);
    }
  }

  // JSONB fields
  if (data.timeline !== undefined) {
    fields.push(`timeline = $${idx++}`);
    values.push(JSON.stringify(data.timeline));
  }
  if (data.menu !== undefined) {
    fields.push(`menu = $${idx++}`);
    values.push(JSON.stringify(data.menu));
  }

  if (fields.length === 0) return null;

  fields.push('updated_at = NOW()');
  values.push(eventId, userId);

  try {
    const result = await dbClient.query(
      `UPDATE events_planner SET ${fields.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING *`,
      values,
    );
    if (result.rows.length === 0) return null;
    return rowToEvent(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to update event', {
      eventId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Guests (event_guests) ──

export async function getGuests(eventId: string): Promise<Guest[]> {
  if (!dbClient.isConnected()) return [];
  try {
    const result = await dbClient.query(
      `SELECT * FROM event_guests WHERE event_id = $1 ORDER BY name ASC`,
      [eventId],
    );
    return result.rows.map((r) => rowToGuest(r as Record<string, unknown>));
  } catch (err) {
    logger.error('Failed to get guests', {
      eventId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

export async function addGuest(
  eventId: string,
  data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    rsvpStatus?: RSVPStatus;
    dietary?: string | null;
    plusOne?: boolean;
    tableNumber?: number | null;
  },
): Promise<Guest | null> {
  if (!dbClient.isConnected()) return null;
  const id = uuidv4();

  try {
    const result = await dbClient.query(
      `INSERT INTO event_guests
       (id, event_id, name, email, phone, rsvp_status, dietary, plus_one, table_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        id, eventId, data.name,
        data.email ?? null, data.phone ?? null,
        data.rsvpStatus ?? 'pending',
        data.dietary ?? null, data.plusOne ?? false,
        data.tableNumber ?? null,
      ],
    );
    return rowToGuest(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to add guest', {
      eventId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function updateGuestRSVP(
  guestId: string,
  rsvpStatus: RSVPStatus,
): Promise<Guest | null> {
  if (!dbClient.isConnected()) return null;

  try {
    const result = await dbClient.query(
      `UPDATE event_guests SET rsvp_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [rsvpStatus, guestId],
    );
    if (result.rows.length === 0) return null;
    return rowToGuest(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to update guest RSVP', {
      guestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── RSVP Summary ──

export async function getRSVPSummary(eventId: string): Promise<RSVPSummary> {
  const empty: RSVPSummary = {
    total: 0,
    confirmed: 0,
    declined: 0,
    maybe: 0,
    pending: 0,
    plusOnes: 0,
  };

  if (!dbClient.isConnected()) return empty;

  try {
    const result = await dbClient.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE rsvp_status = 'confirmed') AS confirmed,
         COUNT(*) FILTER (WHERE rsvp_status = 'declined') AS declined,
         COUNT(*) FILTER (WHERE rsvp_status = 'maybe') AS maybe,
         COUNT(*) FILTER (WHERE rsvp_status = 'pending') AS pending,
         COUNT(*) FILTER (WHERE plus_one = TRUE AND rsvp_status IN ('confirmed', 'maybe')) AS plus_ones
       FROM event_guests WHERE event_id = $1`,
      [eventId],
    );

    if (result.rows.length === 0) return empty;
    const row = result.rows[0] as Record<string, unknown>;

    return {
      total: Number(row['total'] ?? 0),
      confirmed: Number(row['confirmed'] ?? 0),
      declined: Number(row['declined'] ?? 0),
      maybe: Number(row['maybe'] ?? 0),
      pending: Number(row['pending'] ?? 0),
      plusOnes: Number(row['plus_ones'] ?? 0),
    };
  } catch (err) {
    logger.error('Failed to get RSVP summary', {
      eventId,
      error: err instanceof Error ? err.message : String(err),
    });
    return empty;
  }
}

// ── Row Mappers ──

function rowToEvent(row: Record<string, unknown>): Event {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    eventType: (row['event_type'] as EventType) ?? 'autre',
    title: (row['title'] as string) ?? '',
    eventDate: (row['event_date'] as string) ?? '',
    venue: (row['venue'] as string) ?? null,
    budgetCents: Number(row['budget_cents'] ?? 0),
    spentCents: Number(row['spent_cents'] ?? 0),
    guestCount: Number(row['guest_count'] ?? 0),
    status: (row['status'] as EventStatus) ?? 'draft',
    timeline: (row['timeline'] as TimelineMilestone[]) ?? [],
    menu: (row['menu'] as MenuItem[]) ?? [],
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToGuest(row: Record<string, unknown>): Guest {
  return {
    id: row['id'] as string,
    eventId: row['event_id'] as string,
    name: (row['name'] as string) ?? '',
    email: (row['email'] as string) ?? null,
    phone: (row['phone'] as string) ?? null,
    rsvpStatus: (row['rsvp_status'] as RSVPStatus) ?? 'pending',
    dietary: (row['dietary'] as string) ?? null,
    plusOne: (row['plus_one'] as boolean) ?? false,
    tableNumber: (row['table_number'] as number) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}
