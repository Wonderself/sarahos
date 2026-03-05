jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockRepository = {
  listByUser: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getDefaultProject: jest.fn(),
  setDefault: jest.fn(),
  createDefaultForUser: jest.fn(),
};

jest.mock('./project.repository', () => ({
  projectRepository: mockRepository,
}));

import { projectService } from './project.service';
import type { Project } from './project.types';

const baseProject: Project = {
  id: 'proj-1',
  userId: 'user-1',
  name: 'Test Project',
  description: 'A test project',
  isDefault: false,
  isActive: true,
  settings: {},
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const defaultProject: Project = {
  ...baseProject,
  id: 'proj-default',
  name: 'Projet principal',
  isDefault: true,
};

describe('ProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listProjects', () => {
    it('should delegate to repository', async () => {
      mockRepository.listByUser.mockResolvedValue([baseProject, defaultProject]);

      const result = await projectService.listProjects('user-1');

      expect(mockRepository.listByUser).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe('proj-1');
    });

    it('should return empty array when user has no projects', async () => {
      mockRepository.listByUser.mockResolvedValue([]);

      const result = await projectService.listProjects('user-2');
      expect(result).toEqual([]);
    });
  });

  describe('createProject', () => {
    it('should validate input and call repository', async () => {
      mockRepository.create.mockResolvedValue(baseProject);

      const result = await projectService.createProject('user-1', {
        name: 'Test Project',
        description: 'A test project',
      });

      expect(mockRepository.create).toHaveBeenCalledWith('user-1', {
        name: 'Test Project',
        description: 'A test project',
      });
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Test Project');
    });

    it('should reject empty name', async () => {
      const result = await projectService.createProject('user-1', { name: '' });
      expect(result).toBeNull();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should reject whitespace-only name', async () => {
      const result = await projectService.createProject('user-1', { name: '   ' });
      expect(result).toBeNull();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should reject name longer than 100 characters', async () => {
      const longName = 'A'.repeat(101);
      const result = await projectService.createProject('user-1', { name: longName });
      expect(result).toBeNull();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should trim name before saving', async () => {
      mockRepository.create.mockResolvedValue(baseProject);

      await projectService.createProject('user-1', { name: '  Trimmed  ' });

      expect(mockRepository.create).toHaveBeenCalledWith('user-1', {
        name: 'Trimmed',
        description: undefined,
      });
    });
  });

  describe('updateProject', () => {
    it('should validate ownership and call repository', async () => {
      const updated = { ...baseProject, name: 'Updated' };
      mockRepository.update.mockResolvedValue(updated);

      const result = await projectService.updateProject('proj-1', 'user-1', { name: 'Updated' });

      expect(mockRepository.update).toHaveBeenCalledWith('proj-1', 'user-1', { name: 'Updated' });
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Updated');
    });

    it('should reject empty name on update', async () => {
      const result = await projectService.updateProject('proj-1', 'user-1', { name: '' });
      expect(result).toBeNull();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should reject name too long on update', async () => {
      const longName = 'B'.repeat(101);
      const result = await projectService.updateProject('proj-1', 'user-1', { name: longName });
      expect(result).toBeNull();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should trim name and description', async () => {
      mockRepository.update.mockResolvedValue(baseProject);

      await projectService.updateProject('proj-1', 'user-1', {
        name: '  Trimmed Name  ',
        description: '  Trimmed Desc  ',
      });

      expect(mockRepository.update).toHaveBeenCalledWith('proj-1', 'user-1', {
        name: 'Trimmed Name',
        description: 'Trimmed Desc',
      });
    });

    it('should allow update without name field', async () => {
      mockRepository.update.mockResolvedValue({ ...baseProject, description: 'New desc' });

      const result = await projectService.updateProject('proj-1', 'user-1', { description: 'New desc' });

      expect(mockRepository.update).toHaveBeenCalledWith('proj-1', 'user-1', { description: 'New desc' });
      expect(result).not.toBeNull();
    });

    it('should return null when project not found', async () => {
      mockRepository.update.mockResolvedValue(null);

      const result = await projectService.updateProject('proj-999', 'user-1', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteProject', () => {
    it('should delete non-default project', async () => {
      mockRepository.getById.mockResolvedValue(baseProject);
      mockRepository.delete.mockResolvedValue(true);

      const result = await projectService.deleteProject('proj-1', 'user-1');

      expect(result.success).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith('proj-1', 'user-1');
    });

    it('should prevent deleting default project', async () => {
      mockRepository.getById.mockResolvedValue(defaultProject);

      const result = await projectService.deleteProject('proj-default', 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete the default project');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should return error when project not found', async () => {
      mockRepository.getById.mockResolvedValue(null);

      const result = await projectService.deleteProject('proj-999', 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project not found');
    });

    it('should return success false when delete fails', async () => {
      mockRepository.getById.mockResolvedValue(baseProject);
      mockRepository.delete.mockResolvedValue(false);

      const result = await projectService.deleteProject('proj-1', 'user-1');

      expect(result.success).toBe(false);
    });
  });

  describe('ensureDefaultProject', () => {
    it('should return existing default project', async () => {
      mockRepository.getDefaultProject.mockResolvedValue(defaultProject);

      const result = await projectService.ensureDefaultProject('user-1');

      expect(result).not.toBeNull();
      expect(result!.isDefault).toBe(true);
      expect(mockRepository.createDefaultForUser).not.toHaveBeenCalled();
    });

    it('should create default project when none exists', async () => {
      mockRepository.getDefaultProject.mockResolvedValue(null);
      mockRepository.createDefaultForUser.mockResolvedValue(defaultProject);

      const result = await projectService.ensureDefaultProject('user-1');

      expect(mockRepository.createDefaultForUser).toHaveBeenCalledWith('user-1');
      expect(result).not.toBeNull();
      expect(result!.isDefault).toBe(true);
    });

    it('should return null if creation fails', async () => {
      mockRepository.getDefaultProject.mockResolvedValue(null);
      mockRepository.createDefaultForUser.mockResolvedValue(null);

      const result = await projectService.ensureDefaultProject('user-1');
      expect(result).toBeNull();
    });
  });

  describe('setDefaultProject', () => {
    it('should delegate to repository', async () => {
      mockRepository.setDefault.mockResolvedValue(true);

      const result = await projectService.setDefaultProject('proj-1', 'user-1');

      expect(mockRepository.setDefault).toHaveBeenCalledWith('proj-1', 'user-1');
      expect(result).toBe(true);
    });

    it('should return false on failure', async () => {
      mockRepository.setDefault.mockResolvedValue(false);

      const result = await projectService.setDefaultProject('proj-999', 'user-1');
      expect(result).toBe(false);
    });
  });

  describe('getProject', () => {
    it('should return project by id and userId', async () => {
      mockRepository.getById.mockResolvedValue(baseProject);

      const result = await projectService.getProject('proj-1', 'user-1');

      expect(mockRepository.getById).toHaveBeenCalledWith('proj-1', 'user-1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('proj-1');
    });

    it('should return null when not found', async () => {
      mockRepository.getById.mockResolvedValue(null);

      const result = await projectService.getProject('proj-999', 'user-1');
      expect(result).toBeNull();
    });
  });
});
