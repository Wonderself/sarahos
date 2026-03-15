import type { PoolClient } from 'pg';
import { dbClient } from '../infra/database/db-client';
import { logger } from '../utils/logger';

/**
 * Row-Level Security isolation middleware.
 *
 * Wraps database operations in a transaction that sets the PostgreSQL
 * session variables `app.current_user_id` and `ROLE` so that RLS policies
 * enforce tenant isolation at the database level.
 *
 * Usage:
 *   const rows = await withUserContext(userId, async (client) => {
 *     const res = await client.query('SELECT * FROM conversations');
 *     return res.rows;
 *   });
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Execute a callback within a user-scoped RLS context.
 *
 * Sets `app.current_user_id` and switches to the `freenzy_app` role
 * for the duration of the transaction. All queries executed via the
 * provided PoolClient will be subject to RLS policies.
 *
 * @param userId - UUID of the authenticated user
 * @param callback - Function receiving a PoolClient bound to the transaction
 * @returns The value returned by the callback
 * @throws Error if userId is not a valid UUID or if the DB operation fails
 */
export async function withUserContext<T>(
  userId: string,
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  if (!UUID_REGEX.test(userId)) {
    throw new Error(`withUserContext: invalid userId format: ${userId}`);
  }

  const pool = dbClient.getPool();
  if (!pool) {
    throw new Error('withUserContext: database pool not available');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // SET LOCAL scopes the setting to this transaction only — safe for pooled connections
    await client.query('SET LOCAL app.current_user_id = $1', [userId]);
    await client.query('SET LOCAL ROLE freenzy_app');

    const result = await callback(client);

    await client.query('COMMIT');

    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error('withUserContext: rollback failed', {
        service: 'isolation',
        action: 'rollback_failed',
        userId,
        error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
      });
    }

    logger.error('withUserContext: transaction failed', {
      service: 'isolation',
      action: 'user_context_failed',
      userId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  } finally {
    // RESET ROLE ensures the connection returns to the pool with the default role,
    // preventing role leakage between requests
    try {
      await client.query('RESET ROLE');
    } catch {
      // Connection may already be broken — release will handle cleanup
    }
    client.release();
  }
}

/**
 * Execute a callback within an admin context (BYPASSRLS).
 *
 * Uses the `freenzy_admin` role which bypasses all RLS policies.
 * Intended for admin dashboards, cron jobs, and system operations
 * that need unrestricted access to all rows.
 *
 * @param callback - Function receiving a PoolClient bound to the transaction
 * @returns The value returned by the callback
 */
export async function withAdminContext<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = dbClient.getPool();
  if (!pool) {
    throw new Error('withAdminContext: database pool not available');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // freenzy_admin has BYPASSRLS — all RLS policies are skipped
    await client.query('SET LOCAL ROLE freenzy_admin');

    const result = await callback(client);

    await client.query('COMMIT');

    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error('withAdminContext: rollback failed', {
        service: 'isolation',
        action: 'admin_rollback_failed',
        error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
      });
    }

    logger.error('withAdminContext: transaction failed', {
      service: 'isolation',
      action: 'admin_context_failed',
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  } finally {
    try {
      await client.query('RESET ROLE');
    } catch {
      // Connection may already be broken
    }
    client.release();
  }
}
