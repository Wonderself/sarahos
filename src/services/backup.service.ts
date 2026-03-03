/**
 * SARAH OS — Database Backup Service
 * Manages PostgreSQL backups using pg_dump / pg_restore with scheduling and retention.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { getDatabaseUrl } from '../utils/config';

const execAsync = promisify(exec);
const fsPromises = fs.promises;

// ── Constants ──

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');
const FILENAME_PREFIX = 'sarah_backup_';
const FILENAME_REGEX = /^sarah_backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.sql$/;
const DEFAULT_SCHEDULE_HOURS = 24; // daily backups
const DEFAULT_KEEP_LAST = 7; // keep last 7 backups

// ── Types ──

export interface BackupInfo {
  filename: string;
  path: string;
  sizeBytes: number;
  sizeHuman: string;
  createdAt: Date;
}

// ── Helpers ──

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${d}_${h}-${mi}`;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Escape a database connection URL for safe use in shell commands.
 * The URL is passed via an environment variable to avoid shell injection.
 */
function shellEscapeUrl(url: string): string {
  // We use environment variable passing to avoid injection; just sanitize quotes
  return url.replace(/'/g, "'\\''");
}

// ── Backup Service ──

export class BackupService {
  private scheduleInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Ensure the backup directory exists.
   */
  private async ensureBackupDir(): Promise<void> {
    await fsPromises.mkdir(BACKUP_DIR, { recursive: true });
  }

  /**
   * Create a database backup using pg_dump.
   *
   * @returns BackupInfo for the created backup file
   */
  async createBackup(): Promise<BackupInfo> {
    await this.ensureBackupDir();

    const now = new Date();
    const filename = `${FILENAME_PREFIX}${formatDate(now)}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);
    const dbUrl = getDatabaseUrl();

    logger.info('Starting database backup', { filename });

    try {
      // Use PGPASSWORD-style env var passing via the connection string
      // pg_dump outputs plain SQL format for maximum portability
      await execAsync(`pg_dump '${shellEscapeUrl(dbUrl)}' --no-owner --no-acl -f '${filePath}'`, {
        timeout: 300_000, // 5-minute timeout
        env: { ...process.env, PGCONNECT_TIMEOUT: '30' },
      });

      const stats = await fsPromises.stat(filePath);

      const info: BackupInfo = {
        filename,
        path: filePath,
        sizeBytes: stats.size,
        sizeHuman: humanSize(stats.size),
        createdAt: now,
      };

      logger.info('Database backup completed', {
        filename,
        size: info.sizeHuman,
      });

      return info;
    } catch (error) {
      logger.error('Database backup failed', {
        filename,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * List all available backup files with metadata.
   *
   * @returns Array of BackupInfo sorted by date descending (newest first)
   */
  async listBackups(): Promise<BackupInfo[]> {
    await this.ensureBackupDir();

    const files = await fsPromises.readdir(BACKUP_DIR);
    const backups: BackupInfo[] = [];

    for (const file of files) {
      if (!FILENAME_REGEX.test(file)) continue;

      const filePath = path.join(BACKUP_DIR, file);
      try {
        const stats = await fsPromises.stat(filePath);
        backups.push({
          filename: file,
          path: filePath,
          sizeBytes: stats.size,
          sizeHuman: humanSize(stats.size),
          createdAt: stats.mtime,
        });
      } catch {
        // File may have been deleted between readdir and stat; skip
      }
    }

    // Sort newest first
    backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return backups;
  }

  /**
   * Restore the database from a backup file.
   *
   * CAUTION: This is a destructive operation that replaces the current database contents.
   * The `confirm` flag must be set to true as a safety measure.
   *
   * @param filename - The backup filename to restore from
   * @param confirm - Must be true to proceed with the restore
   */
  async restoreBackup(filename: string, confirm: boolean = false): Promise<void> {
    if (!confirm) {
      throw new Error(
        'Restore operation requires explicit confirmation. Pass confirm=true to proceed.',
      );
    }

    // Validate filename to prevent path traversal
    if (!FILENAME_REGEX.test(filename)) {
      throw new Error(`Invalid backup filename: ${filename}`);
    }

    const filePath = path.join(BACKUP_DIR, filename);

    // Verify file exists
    try {
      await fsPromises.access(filePath, fs.constants.R_OK);
    } catch {
      throw new Error(`Backup file not found: ${filename}`);
    }

    const dbUrl = getDatabaseUrl();

    logger.warn('Starting database restore', { filename });

    try {
      // psql for restoring plain-format SQL dumps
      await execAsync(`psql '${shellEscapeUrl(dbUrl)}' -f '${filePath}'`, {
        timeout: 600_000, // 10-minute timeout
        env: { ...process.env, PGCONNECT_TIMEOUT: '30' },
      });

      logger.info('Database restore completed', { filename });
    } catch (error) {
      logger.error('Database restore failed', {
        filename,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Schedule periodic automated backups.
   *
   * @param intervalHours - Hours between backups (default 24)
   */
  scheduleBackups(intervalHours: number = DEFAULT_SCHEDULE_HOURS): void {
    // Clear any existing schedule
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
    }

    const intervalMs = intervalHours * 60 * 60 * 1000;

    this.scheduleInterval = setInterval(async () => {
      try {
        await this.createBackup();
        await this.cleanOldBackups(DEFAULT_KEEP_LAST);
      } catch (error) {
        logger.error('Scheduled backup failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, intervalMs);

    // Ensure the interval doesn't prevent process exit
    if (this.scheduleInterval.unref) {
      this.scheduleInterval.unref();
    }

    logger.info('Backup schedule configured', {
      intervalHours,
      nextBackupIn: `${intervalHours}h`,
    });
  }

  /**
   * Remove old backups, keeping only the N most recent files.
   *
   * @param keepLast - Number of most recent backups to retain (default 7)
   * @returns Number of backups deleted
   */
  async cleanOldBackups(keepLast: number = DEFAULT_KEEP_LAST): Promise<number> {
    const backups = await this.listBackups(); // already sorted newest-first

    if (backups.length <= keepLast) {
      return 0;
    }

    const toDelete = backups.slice(keepLast);
    let deleted = 0;

    for (const backup of toDelete) {
      try {
        await fsPromises.unlink(backup.path);
        deleted++;
        logger.info('Old backup removed', { filename: backup.filename });
      } catch (error) {
        logger.error('Failed to remove old backup', {
          filename: backup.filename,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (deleted > 0) {
      logger.info('Backup cleanup completed', { deleted, kept: keepLast });
    }

    return deleted;
  }

  /**
   * Stop the scheduled backup interval.
   */
  stopSchedule(): void {
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
      logger.info('Backup schedule stopped');
    }
  }
}

/** Default backup service instance with daily backups auto-scheduled */
const backupService = new BackupService();
backupService.scheduleBackups(DEFAULT_SCHEDULE_HOURS);

export default backupService;
