jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockDbClient = {
  isConnected: jest.fn().mockReturnValue(true),
  query: jest.fn(),
};

jest.mock('../infra', () => ({
  dbClient: mockDbClient,
}));

jest.mock('uuid', () => ({ v4: () => 'test-uuid-1' }));

import { projectRepository } from './project.repository';

const baseRow = {
  id: 'proj-1',
  user_id: 'user-1',
  name: 'Test Project',
  description: 'A test project',
  is_default: false,
  is_active: true,
  settings: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const defaultRow = {
  ...baseRow,
  id: 'proj-default',
  name: 'Projet principal',
  description: 'Projet par défaut',
  is_default: true,
};

describe('ProjectRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbClient.isConnected.mockReturnValue(true);
  });

  describe('listByUser', () => {
    it('should return user projects', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [baseRow, defaultRow] });

      const result = await projectRepository.listByUser('user-1');

      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM projects WHERE user_id'),
        ['user-1'],
      );
      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe('proj-1');
      expect(result[0]!.name).toBe('Test Project');
      expect(result[1]!.isDefault).toBe(true);
    });

    it('should return empty array when not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await projectRepository.listByUser('user-1');
      expect(result).toEqual([]);
      expect(mockDbClient.query).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return project when found', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [baseRow] });

      const result = await projectRepository.getById('proj-1', 'user-1');

      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM projects WHERE id'),
        ['proj-1', 'user-1'],
      );
      expect(result).not.toBeNull();
      expect(result!.id).toBe('proj-1');
      expect(result!.userId).toBe('user-1');
    });

    it('should return null when not found', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });

      const result = await projectRepository.getById('proj-999', 'user-1');
      expect(result).toBeNull();
    });

    it('should return null when not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await projectRepository.getById('proj-1', 'user-1');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should insert new project and return it', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [{ ...baseRow, id: 'test-uuid-1' }] });

      const result = await projectRepository.create('user-1', {
        name: 'New Project',
        description: 'Description',
      });

      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO projects'),
        ['test-uuid-1', 'user-1', 'New Project', 'Description'],
      );
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Test Project');
    });

    it('should return null on database error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('DB error'));

      const result = await projectRepository.create('user-1', { name: 'Fail' });
      expect(result).toBeNull();
    });

    it('should return null when not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await projectRepository.create('user-1', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should modify project and return updated row', async () => {
      const updatedRow = { ...baseRow, name: 'Updated Name' };
      mockDbClient.query.mockResolvedValue({ rows: [updatedRow] });

      const result = await projectRepository.update('proj-1', 'user-1', { name: 'Updated Name' });

      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE projects SET'),
        expect.arrayContaining(['Updated Name', 'proj-1', 'user-1']),
      );
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Updated Name');
    });

    it('should return null when not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await projectRepository.update('proj-1', 'user-1', { name: 'Test' });
      expect(result).toBeNull();
    });

    it('should return null when project not found', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });
      const result = await projectRepository.update('proj-999', 'user-1', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove non-default project', async () => {
      // First call: getById (for the guard check)
      mockDbClient.query
        .mockResolvedValueOnce({ rows: [baseRow] })
        // Second call: DELETE
        .mockResolvedValueOnce({ rows: [{ id: 'proj-1' }] });

      const result = await projectRepository.delete('proj-1', 'user-1');
      expect(result).toBe(true);
      expect(mockDbClient.query).toHaveBeenCalledTimes(2);
    });

    it('should refuse to delete default project', async () => {
      mockDbClient.query.mockResolvedValueOnce({ rows: [defaultRow] });

      const result = await projectRepository.delete('proj-default', 'user-1');
      expect(result).toBe(false);
    });

    it('should return false when project not found', async () => {
      mockDbClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await projectRepository.delete('proj-999', 'user-1');
      expect(result).toBe(false);
    });

    it('should return false when not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await projectRepository.delete('proj-1', 'user-1');
      expect(result).toBe(false);
    });
  });

  describe('getDefaultProject', () => {
    it('should return the default project', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [defaultRow] });

      const result = await projectRepository.getDefaultProject('user-1');

      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('is_default = TRUE'),
        ['user-1'],
      );
      expect(result).not.toBeNull();
      expect(result!.isDefault).toBe(true);
      expect(result!.name).toBe('Projet principal');
    });

    it('should return null when no default exists', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });
      const result = await projectRepository.getDefaultProject('user-1');
      expect(result).toBeNull();
    });

    it('should return null when not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await projectRepository.getDefaultProject('user-1');
      expect(result).toBeNull();
    });
  });

  describe('setDefault', () => {
    it('should update default flag', async () => {
      // First call: unset old defaults
      mockDbClient.query
        .mockResolvedValueOnce({ rows: [] })
        // Second call: set new default
        .mockResolvedValueOnce({ rows: [{ id: 'proj-1' }] });

      const result = await projectRepository.setDefault('proj-1', 'user-1');
      expect(result).toBe(true);
      expect(mockDbClient.query).toHaveBeenCalledTimes(2);
      // First query: unset all defaults for user
      expect(mockDbClient.query.mock.calls[0][0]).toContain('is_default = FALSE');
      // Second query: set new default
      expect(mockDbClient.query.mock.calls[1][0]).toContain('is_default = TRUE');
    });

    it('should return false on error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('DB error'));
      const result = await projectRepository.setDefault('proj-1', 'user-1');
      expect(result).toBe(false);
    });

    it('should return false when not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await projectRepository.setDefault('proj-1', 'user-1');
      expect(result).toBe(false);
    });
  });

  describe('createDefaultForUser', () => {
    it('should create a default project', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [defaultRow] });

      const result = await projectRepository.createDefaultForUser('user-1');

      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO projects'),
        ['test-uuid-1', 'user-1', 'Projet principal', 'Projet par défaut'],
      );
      expect(result).not.toBeNull();
      expect(result!.isDefault).toBe(true);
      expect(result!.name).toBe('Projet principal');
    });

    it('should use custom name when provided', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [{ ...defaultRow, name: 'Custom' }] });

      await projectRepository.createDefaultForUser('user-1', 'Custom');

      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO projects'),
        ['test-uuid-1', 'user-1', 'Custom', 'Projet par défaut'],
      );
    });

    it('should return null on database error', async () => {
      mockDbClient.query.mockRejectedValue(new Error('DB error'));
      const result = await projectRepository.createDefaultForUser('user-1');
      expect(result).toBeNull();
    });

    it('should return null when not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await projectRepository.createDefaultForUser('user-1');
      expect(result).toBeNull();
    });
  });
});
