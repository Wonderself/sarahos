// ===============================================================
// Ecrivain Agent — Tools & Repository ("Mon Ecrivain")
// Persistence SQL pour writing_projects et writing_chapters
// ===============================================================

import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../../../../infra';
import { logger } from '../../../../utils/logger';
import type {
  WritingProject,
  WritingChapter,
  ProjectProgress,
  ProjectType,
  ProjectStatus,
  ChapterStatus,
  WritingCharacter,
} from './ecrivain.types';

// ── Projects (writing_projects) ──

export async function getProjects(
  userId: string,
  statusFilter?: ProjectStatus,
): Promise<WritingProject[]> {
  if (!dbClient.isConnected()) return [];
  try {
    const conditions = ['user_id = $1'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (statusFilter) {
      conditions.push(`status = $${idx++}`);
      values.push(statusFilter);
    }

    const result = await dbClient.query(
      `SELECT * FROM writing_projects
       WHERE ${conditions.join(' AND ')}
       ORDER BY updated_at DESC`,
      values,
    );
    return result.rows.map((r) => rowToProject(r as Record<string, unknown>));
  } catch (err) {
    logger.error('Failed to get writing projects', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

export async function getProject(
  projectId: string,
  userId: string,
): Promise<WritingProject | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const result = await dbClient.query(
      `SELECT * FROM writing_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId],
    );
    if (result.rows.length === 0) return null;
    return rowToProject(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to get writing project', {
      projectId,
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function createProject(
  userId: string,
  data: {
    title: string;
    genre?: string;
    projectType?: ProjectType;
    synopsis?: string | null;
    targetWordCount?: number;
    characters?: WritingCharacter[];
    styleNotes?: string | null;
  },
): Promise<WritingProject | null> {
  if (!dbClient.isConnected()) return null;
  const id = uuidv4();

  try {
    const result = await dbClient.query(
      `INSERT INTO writing_projects
       (id, user_id, title, genre, project_type, synopsis, target_word_count,
        current_word_count, status, characters, style_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        id, userId, data.title,
        data.genre ?? null,
        data.projectType ?? 'roman',
        data.synopsis ?? null,
        data.targetWordCount ?? 80000,
        0,
        'draft',
        JSON.stringify(data.characters ?? []),
        data.styleNotes ?? null,
      ],
    );
    return rowToProject(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to create writing project', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function updateProject(
  projectId: string,
  userId: string,
  updates: Partial<{
    title: string;
    genre: string;
    projectType: ProjectType;
    synopsis: string | null;
    targetWordCount: number;
    currentWordCount: number;
    status: ProjectStatus;
    characters: WritingCharacter[];
    styleNotes: string | null;
  }>,
): Promise<WritingProject | null> {
  if (!dbClient.isConnected()) return null;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const directFields: Array<[string, unknown]> = [
    ['title', updates.title],
    ['genre', updates.genre],
    ['project_type', updates.projectType],
    ['synopsis', updates.synopsis],
    ['target_word_count', updates.targetWordCount],
    ['current_word_count', updates.currentWordCount],
    ['status', updates.status],
    ['style_notes', updates.styleNotes],
  ];

  for (const [col, val] of directFields) {
    if (val !== undefined) {
      fields.push(`${col} = $${idx++}`);
      values.push(val);
    }
  }

  // JSONB field
  if (updates.characters !== undefined) {
    fields.push(`characters = $${idx++}`);
    values.push(JSON.stringify(updates.characters));
  }

  if (fields.length === 0) return null;

  fields.push('updated_at = NOW()');
  values.push(projectId, userId);

  try {
    const result = await dbClient.query(
      `UPDATE writing_projects SET ${fields.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING *`,
      values,
    );
    if (result.rows.length === 0) return null;
    return rowToProject(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to update writing project', {
      projectId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Chapters (writing_chapters) ──

export async function getChapters(projectId: string): Promise<WritingChapter[]> {
  if (!dbClient.isConnected()) return [];
  try {
    const result = await dbClient.query(
      `SELECT * FROM writing_chapters WHERE project_id = $1 ORDER BY chapter_number ASC`,
      [projectId],
    );
    return result.rows.map((r) => rowToChapter(r as Record<string, unknown>));
  } catch (err) {
    logger.error('Failed to get chapters', {
      projectId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

export async function getChapter(chapterId: string): Promise<WritingChapter | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const result = await dbClient.query(
      `SELECT * FROM writing_chapters WHERE id = $1`,
      [chapterId],
    );
    if (result.rows.length === 0) return null;
    return rowToChapter(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to get chapter', {
      chapterId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function createChapter(
  projectId: string,
  data: {
    chapterNumber?: number;
    title?: string;
    content?: string | null;
    wordCount?: number;
    status?: ChapterStatus;
    aiNotes?: string | null;
  },
): Promise<WritingChapter | null> {
  if (!dbClient.isConnected()) return null;
  const id = uuidv4();

  try {
    const result = await dbClient.query(
      `INSERT INTO writing_chapters
       (id, project_id, chapter_number, title, content, word_count, status, ai_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        id, projectId,
        data.chapterNumber ?? 1,
        data.title ?? null,
        data.content ?? null,
        data.wordCount ?? 0,
        data.status ?? 'draft',
        data.aiNotes ?? null,
      ],
    );
    return rowToChapter(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to create chapter', {
      projectId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function updateChapter(
  chapterId: string,
  data: Partial<{
    title: string;
    content: string | null;
    wordCount: number;
    status: ChapterStatus;
    aiNotes: string | null;
  }>,
): Promise<WritingChapter | null> {
  if (!dbClient.isConnected()) return null;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const directFields: Array<[string, unknown]> = [
    ['title', data.title],
    ['content', data.content],
    ['word_count', data.wordCount],
    ['status', data.status],
    ['ai_notes', data.aiNotes],
  ];

  for (const [col, val] of directFields) {
    if (val !== undefined) {
      fields.push(`${col} = $${idx++}`);
      values.push(val);
    }
  }

  if (fields.length === 0) return null;

  fields.push('updated_at = NOW()');
  values.push(chapterId);

  try {
    const result = await dbClient.query(
      `UPDATE writing_chapters SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );
    if (result.rows.length === 0) return null;
    return rowToChapter(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to update chapter', {
      chapterId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Project Progress ──

export async function getProjectProgress(
  projectId: string,
  userId: string,
): Promise<ProjectProgress> {
  const empty: ProjectProgress = {
    projectId,
    title: '',
    targetWordCount: 0,
    currentWordCount: 0,
    percentComplete: 0,
    totalChapters: 0,
    completedChapters: 0,
    inProgressChapters: 0,
    draftChapters: 0,
    averageWordsPerChapter: 0,
    estimatedChaptersRemaining: 0,
  };

  if (!dbClient.isConnected()) return empty;

  try {
    // Recuperer les infos du projet
    const projectResult = await dbClient.query(
      `SELECT title, target_word_count, current_word_count
       FROM writing_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId],
    );

    if (projectResult.rows.length === 0) return empty;
    const project = projectResult.rows[0] as Record<string, unknown>;

    // Statistiques des chapitres
    const chapterResult = await dbClient.query(
      `SELECT
         COUNT(*) AS total_chapters,
         COUNT(*) FILTER (WHERE status = 'completed') AS completed_chapters,
         COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_chapters,
         COUNT(*) FILTER (WHERE status = 'draft') AS draft_chapters,
         COALESCE(SUM(word_count), 0) AS total_words,
         CASE WHEN COUNT(*) FILTER (WHERE word_count > 0) > 0
           THEN COALESCE(SUM(word_count), 0) / COUNT(*) FILTER (WHERE word_count > 0)
           ELSE 0
         END AS avg_words_per_chapter
       FROM writing_chapters WHERE project_id = $1`,
      [projectId],
    );

    const chapters = chapterResult.rows[0] as Record<string, unknown>;
    const targetWords = Number(project['target_word_count'] ?? 0);
    const currentWords = Number(chapters['total_words'] ?? 0);
    const avgWordsPerChapter = Number(chapters['avg_words_per_chapter'] ?? 0);

    const percentComplete = targetWords > 0
      ? Math.min(100, Math.round((currentWords / targetWords) * 100))
      : 0;

    const remainingWords = Math.max(0, targetWords - currentWords);
    const estimatedChaptersRemaining = avgWordsPerChapter > 0
      ? Math.ceil(remainingWords / avgWordsPerChapter)
      : 0;

    return {
      projectId,
      title: (project['title'] as string) ?? '',
      targetWordCount: targetWords,
      currentWordCount: currentWords,
      percentComplete,
      totalChapters: Number(chapters['total_chapters'] ?? 0),
      completedChapters: Number(chapters['completed_chapters'] ?? 0),
      inProgressChapters: Number(chapters['in_progress_chapters'] ?? 0),
      draftChapters: Number(chapters['draft_chapters'] ?? 0),
      averageWordsPerChapter: avgWordsPerChapter,
      estimatedChaptersRemaining,
    };
  } catch (err) {
    logger.error('Failed to get project progress', {
      projectId,
      error: err instanceof Error ? err.message : String(err),
    });
    return empty;
  }
}

// ── Formatteur de rapport de progression ──

export function formatProgressReport(
  project: WritingProject,
  chapters: WritingChapter[],
): string {
  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  const targetWords = project.targetWordCount;
  const percent = targetWords > 0
    ? Math.min(100, Math.round((totalWords / targetWords) * 100))
    : 0;

  // Barre de progression visuelle (20 caracteres)
  const filledCount = Math.round(percent / 5);
  const progressBar = '#'.repeat(filledCount) + '-'.repeat(20 - filledCount);

  const completedChapters = chapters.filter((ch) => ch.status === 'completed').length;
  const inProgressChapters = chapters.filter((ch) => ch.status === 'in_progress').length;
  const draftChapters = chapters.filter((ch) => ch.status === 'draft').length;

  const avgWords = chapters.length > 0
    ? Math.round(totalWords / chapters.length)
    : 0;

  const lines = [
    '== RAPPORT DE PROGRESSION ==',
    `Projet    : ${project.title}`,
    `Genre     : ${project.genre ?? 'Non defini'}`,
    `Type      : ${project.projectType}`,
    `Statut    : ${project.status}`,
    '',
    '-- PROGRESSION --',
    `[${progressBar}] ${percent}%`,
    `Mots      : ${totalWords} / ${targetWords}`,
    `Restant   : ${Math.max(0, targetWords - totalWords)} mots`,
    '',
    '-- CHAPITRES --',
    `Total     : ${chapters.length}`,
    `Termines  : ${completedChapters}`,
    `En cours  : ${inProgressChapters}`,
    `Brouillon : ${draftChapters}`,
    `Moyenne   : ${avgWords} mots/chapitre`,
    '',
  ];

  // Detail par chapitre
  if (chapters.length > 0) {
    lines.push('-- DETAIL PAR CHAPITRE --');
    for (const ch of chapters) {
      const statusIcon = ch.status === 'completed' ? '[OK]'
        : ch.status === 'in_progress' ? '[>>]'
        : ch.status === 'revised' ? '[RV]'
        : '[..]';
      const title = (ch.title ?? `Chapitre ${ch.chapterNumber}`).padEnd(25).slice(0, 25);
      lines.push(`  ${statusIcon} ${ch.chapterNumber}. ${title} ${ch.wordCount} mots`);
    }
    lines.push('');
  }

  // Paliers
  const milestones = [1000, 5000, 10000, 20000, 50000, 80000, 100000];
  const reached = milestones.filter((m) => totalWords >= m);
  const next = milestones.find((m) => totalWords < m);

  if (reached.length > 0) {
    lines.push('-- PALIERS ATTEINTS --');
    for (const m of reached) {
      lines.push(`  * ${m} mots atteints !`);
    }
    lines.push('');
  }

  if (next) {
    lines.push(`Prochain palier : ${next} mots (encore ${next - totalWords} mots)`);
    lines.push('');
  }

  return lines.join('\n');
}

// ── Row Mappers (exported pour les tests) ──

export function rowToProject(row: Record<string, unknown>): WritingProject {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    title: (row['title'] as string) ?? '',
    genre: (row['genre'] as string) ?? null,
    projectType: (row['project_type'] as ProjectType) ?? 'roman',
    synopsis: (row['synopsis'] as string) ?? null,
    targetWordCount: Number(row['target_word_count'] ?? 0),
    currentWordCount: Number(row['current_word_count'] ?? 0),
    status: (row['status'] as ProjectStatus) ?? 'draft',
    characters: (row['characters'] as WritingCharacter[]) ?? [],
    styleNotes: (row['style_notes'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

export function rowToChapter(row: Record<string, unknown>): WritingChapter {
  return {
    id: row['id'] as string,
    projectId: row['project_id'] as string,
    chapterNumber: Number(row['chapter_number'] ?? 1),
    title: (row['title'] as string) ?? null,
    content: (row['content'] as string) ?? null,
    wordCount: Number(row['word_count'] ?? 0),
    status: (row['status'] as ChapterStatus) ?? 'draft',
    aiNotes: (row['ai_notes'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}
