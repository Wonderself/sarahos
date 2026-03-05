import { projectRepository } from './project.repository';
import { logger } from '../utils/logger';
import type { Project, CreateProjectInput, UpdateProjectInput } from './project.types';

class ProjectService {
  async listProjects(userId: string): Promise<Project[]> {
    return projectRepository.listByUser(userId);
  }

  async getProject(id: string, userId: string): Promise<Project | null> {
    return projectRepository.getById(id, userId);
  }

  async createProject(userId: string, input: CreateProjectInput): Promise<Project | null> {
    if (!input.name || input.name.trim().length === 0) {
      logger.warn('Project creation failed: name is required', { userId });
      return null;
    }
    if (input.name.trim().length > 100) {
      logger.warn('Project creation failed: name too long', { userId, nameLength: input.name.length });
      return null;
    }

    return projectRepository.create(userId, {
      name: input.name.trim(),
      description: input.description?.trim(),
    });
  }

  async updateProject(id: string, userId: string, input: UpdateProjectInput): Promise<Project | null> {
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        logger.warn('Project update failed: name cannot be empty', { id, userId });
        return null;
      }
      if (input.name.trim().length > 100) {
        logger.warn('Project update failed: name too long', { id, userId });
        return null;
      }
      input.name = input.name.trim();
    }
    if (input.description !== undefined) {
      input.description = input.description.trim();
    }

    return projectRepository.update(id, userId, input);
  }

  async deleteProject(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const project = await projectRepository.getById(id, userId);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }
    if (project.isDefault) {
      return { success: false, error: 'Cannot delete the default project' };
    }

    const deleted = await projectRepository.delete(id, userId);
    return { success: deleted };
  }

  async setDefaultProject(id: string, userId: string): Promise<boolean> {
    return projectRepository.setDefault(id, userId);
  }

  async ensureDefaultProject(userId: string): Promise<Project | null> {
    const existing = await projectRepository.getDefaultProject(userId);
    if (existing) return existing;

    logger.info('Creating default project for user', { userId });
    return projectRepository.createDefaultForUser(userId);
  }
}

export const projectService = new ProjectService();
