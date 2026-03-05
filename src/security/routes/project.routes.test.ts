jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/config', () => ({
  config: {
    JWT_SECRET: 'test-secret-at-least-16-chars',
    JWT_EXPIRES_IN: '1h',
    API_KEYS_ADMIN: 'admin-key',
    API_KEYS_OPERATOR: '',
    API_KEYS_VIEWER: '',
    API_KEYS_SYSTEM: '',
  },
}));

const mockProjectService = {
  listProjects: jest.fn(),
  getProject: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  setDefaultProject: jest.fn(),
  ensureDefaultProject: jest.fn(),
};

jest.mock('../../projects/project.service', () => ({
  projectService: mockProjectService,
}));

import express from 'express';
import request from 'supertest';
import { AuthService } from '../auth.service';
import { createProjectRouter } from './project.routes';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(createProjectRouter());
  return app;
}

const authService = new AuthService();

function userToken(): string {
  return authService.generateToken('test@test.com', 'admin', { userId: 'test-user-id', tier: 'paid' as never });
}

const sampleProject = {
  id: 'p0000000-0000-4000-8000-000000000001',
  userId: 'test-user-id',
  name: 'Mon Projet',
  description: 'Description du projet',
  settings: {},
  isActive: true,
  isDefault: false,
  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-01'),
};

describe('Project Routes', () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /portal/projects', () => {
    it('should return user projects (200)', async () => {
      mockProjectService.listProjects.mockResolvedValue([sampleProject]);

      const res = await request(app)
        .get('/portal/projects')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toHaveLength(1);
      expect(res.body.projects[0].id).toBe(sampleProject.id);
      expect(mockProjectService.listProjects).toHaveBeenCalledWith('test-user-id');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/portal/projects');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /portal/projects', () => {
    it('should create project (201)', async () => {
      mockProjectService.createProject.mockResolvedValue(sampleProject);

      const res = await request(app)
        .post('/portal/projects')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ name: 'Mon Projet', description: 'Description du projet' });

      expect(res.status).toBe(201);
      expect(res.body.project).toBeDefined();
      expect(res.body.project.id).toBe(sampleProject.id);
      expect(mockProjectService.createProject).toHaveBeenCalledWith('test-user-id', {
        name: 'Mon Projet',
        description: 'Description du projet',
      });
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/portal/projects')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ description: 'No name provided' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Project name is required');
    });

    it('should return 400 when name is empty string', async () => {
      const res = await request(app)
        .post('/portal/projects')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ name: '  ', description: 'Empty name' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Project name is required');
    });

    it('should return 400 when service returns null (duplicate or too long)', async () => {
      mockProjectService.createProject.mockResolvedValue(null);

      const res = await request(app)
        .post('/portal/projects')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ name: 'Valid Name' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Failed to create project');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/portal/projects')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /portal/projects/:id', () => {
    it('should update project (200)', async () => {
      const updatedProject = { ...sampleProject, name: 'Projet Modifie' };
      mockProjectService.updateProject.mockResolvedValue(updatedProject);

      const res = await request(app)
        .patch(`/portal/projects/${sampleProject.id}`)
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ name: 'Projet Modifie' });

      expect(res.status).toBe(200);
      expect(res.body.project.name).toBe('Projet Modifie');
      expect(mockProjectService.updateProject).toHaveBeenCalledWith(
        sampleProject.id,
        'test-user-id',
        expect.objectContaining({ name: 'Projet Modifie' }),
      );
    });

    it('should return 400 when project not found or invalid input', async () => {
      mockProjectService.updateProject.mockResolvedValue(null);

      const res = await request(app)
        .patch('/portal/projects/nonexistent-id')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ name: 'Updated' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Failed to update project');
    });
  });

  describe('DELETE /portal/projects/:id', () => {
    it('should delete project and return message', async () => {
      mockProjectService.deleteProject.mockResolvedValue({ success: true });

      const res = await request(app)
        .delete(`/portal/projects/${sampleProject.id}`)
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Project deleted');
      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(sampleProject.id, 'test-user-id');
    });

    it('should return 400 when deletion fails (not found)', async () => {
      mockProjectService.deleteProject.mockResolvedValue({ success: false, error: 'Project not found' });

      const res = await request(app)
        .delete('/portal/projects/nonexistent-id')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Project not found');
    });

    it('should return 400 when trying to delete default project', async () => {
      mockProjectService.deleteProject.mockResolvedValue({ success: false, error: 'Cannot delete the default project' });

      const res = await request(app)
        .delete(`/portal/projects/${sampleProject.id}`)
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Cannot delete the default project');
    });
  });

  describe('POST /portal/projects/:id/set-default', () => {
    it('should set default project (200)', async () => {
      mockProjectService.setDefaultProject.mockResolvedValue(true);

      const res = await request(app)
        .post(`/portal/projects/${sampleProject.id}/set-default`)
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Default project updated');
      expect(mockProjectService.setDefaultProject).toHaveBeenCalledWith(sampleProject.id, 'test-user-id');
    });

    it('should return 400 when set-default fails', async () => {
      mockProjectService.setDefaultProject.mockResolvedValue(false);

      const res = await request(app)
        .post('/portal/projects/nonexistent-id/set-default')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Failed to set default project');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post(`/portal/projects/${sampleProject.id}/set-default`);

      expect(res.status).toBe(401);
    });
  });
});
