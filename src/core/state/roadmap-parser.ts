import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logger';
import type { TaskState } from './state.types';

const ROADMAP_FILE = path.resolve(process.cwd(), 'roadmap', 'ROADMAP.md');

export interface RoadmapTask {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  phase: number;
}

export class RoadmapParser {
  private content = '';

  async load(): Promise<string> {
    this.content = await fs.readFile(ROADMAP_FILE, 'utf-8');
    logger.debug('Roadmap loaded', { length: this.content.length });
    return this.content;
  }

  parseTasks(): RoadmapTask[] {
    if (!this.content) {
      throw new Error('Roadmap not loaded. Call load() first.');
    }

    const tasks: RoadmapTask[] = [];
    const lines = this.content.split('\n');
    let currentPhase = 0;

    for (const line of lines) {
      // Detect phase headers
      const phaseMatch = line.match(/^## Phase (\d+)/);
      if (phaseMatch?.[1]) {
        currentPhase = parseInt(phaseMatch[1], 10);
        continue;
      }

      // Detect task lines: - [x] TASK-001 — Description (PRIORITY)
      const taskMatch = line.match(/^- \[([ x])\] (TASK-\d{3,})\s*[—–-]\s*(.+?)(?:\s*\((\w+)\))?\s*$/);
      if (taskMatch) {
        const [, checked, id, title, priority] = taskMatch;
        if (id && title) {
          tasks.push({
            id,
            title: title.trim(),
            completed: checked === 'x',
            priority: priority ?? 'MEDIUM',
            phase: currentPhase,
          });
        }
      }
    }

    return tasks;
  }

  async markTaskCompleted(taskId: string): Promise<void> {
    if (!this.content) {
      await this.load();
    }

    const pattern = new RegExp(`^(- \\[) \\] (${taskId})`, 'm');
    if (!pattern.test(this.content)) {
      logger.warn(`Task ${taskId} not found in roadmap`);
      return;
    }

    this.content = this.content.replace(pattern, '$1x] $2');
    await fs.writeFile(ROADMAP_FILE, this.content, 'utf-8');
    logger.info(`Task ${taskId} marked as completed in roadmap`);
  }

  async addTask(task: TaskState, underPhase: number): Promise<void> {
    if (!this.content) {
      await this.load();
    }

    const taskLine = `- [ ] ${task.task_id} — ${task.title} (${task.priority})`;
    const phasePattern = new RegExp(`(## Phase ${underPhase}[^]*?)(\n## |$)`);
    const match = this.content.match(phasePattern);

    if (match?.[1]) {
      const insertPoint = this.content.indexOf(match[1]) + match[1].length;
      this.content = this.content.slice(0, insertPoint) + '\n' + taskLine + this.content.slice(insertPoint);
      await fs.writeFile(ROADMAP_FILE, this.content, 'utf-8');
      logger.info(`Task ${task.task_id} added to roadmap under Phase ${underPhase}`);
    }
  }

  getCurrentPhase(): number {
    const match = this.content.match(/## Current Phase: (\d+)/);
    return match?.[1] ? parseInt(match[1], 10) : 1;
  }
}

export const roadmapParser = new RoadmapParser();
