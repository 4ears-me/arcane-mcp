import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectsApi } from './projects.js';
import type { ArcaneClient } from './client.js';
import type { ProjectSummary, ProjectDetails, CreateProject, ProjectStatusCounts } from '../types/project.js';

describe('ProjectsApi', () => {
  let mockClient: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let api: ProjectsApi;

  const mockProjectSummary: ProjectSummary = {
    id: 'project-1',
    name: 'test-project',
    environmentId: 'env-1',
    status: 'running',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockProjectDetails: ProjectDetails = {
    id: 'project-1',
    name: 'test-project',
    environmentId: 'env-1',
    status: 'running',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    composeFile: 'version: "3"\nservices:\n  web:\n    image: nginx',
    services: [
      { name: 'web', containerId: 'container-1', status: 'running', ports: ['80:80'] },
    ],
    path: '/app',
  };

  const mockCreateProject: CreateProject = {
    name: 'new-project',
    environmentId: 'env-1',
    composeFile: 'version: "3"\nservices:\n  app:\n    image: node:18',
    path: '/app',
  };

  const mockStatusCounts: ProjectStatusCounts = {
    running: 5,
    stopped: 2,
    partial: 1,
    error: 0,
    total: 8,
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    api = new ProjectsApi(mockClient as unknown as ArcaneClient);
  });

  describe('list', () => {
    it('should call correct endpoint with environmentId', async () => {
      mockClient.get.mockResolvedValue({ data: [mockProjectSummary] });

      const result = await api.list('env-1');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/environments/env-1/projects',
        undefined
      );
      expect(result).toEqual([mockProjectSummary]);
    });

    it('should pass pagination params to the endpoint', async () => {
      mockClient.get.mockResolvedValue({ data: [mockProjectSummary] });

      const result = await api.list('env-1', { start: 0, limit: 10 });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/environments/env-1/projects',
        { start: 0, limit: 10 }
      );
      expect(result).toEqual([mockProjectSummary]);
    });
  });

  describe('get', () => {
    it('should call correct endpoint with environmentId and projectId', async () => {
      mockClient.get.mockResolvedValue({ data: mockProjectDetails });

      const result = await api.get('env-1', 'project-1');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/environments/env-1/projects/project-1'
      );
      expect(result).toEqual(mockProjectDetails);
    });
  });

  describe('create', () => {
    it('should call POST with project data', async () => {
      mockClient.post.mockResolvedValue({ data: mockProjectDetails });

      const result = await api.create('env-1', mockCreateProject);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-1/projects',
        mockCreateProject
      );
      expect(result).toEqual(mockProjectDetails);
    });
  });

  describe('update', () => {
    it('should call PUT with project data', async () => {
      const updateData = { name: 'updated-project' };
      mockClient.put.mockResolvedValue({ data: mockProjectDetails });

      const result = await api.update('env-1', 'project-1', updateData);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/environments/env-1/projects/project-1',
        updateData
      );
      expect(result).toEqual(mockProjectDetails);
    });
  });

  describe('delete', () => {
    it('should call DELETE to destroy endpoint', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await api.delete('env-1', 'project-1');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/api/environments/env-1/projects/project-1'
      );
    });
  });

  describe('deploy', () => {
    it('should call POST to deploy endpoint', async () => {
      mockClient.post.mockResolvedValue(undefined);

      await api.deploy('env-1', 'project-1');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-1/projects/project-1/deploy'
      );
    });
  });

  describe('stop', () => {
    it('should call POST to stop endpoint', async () => {
      mockClient.post.mockResolvedValue(undefined);

      await api.stop('env-1', 'project-1');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-1/projects/project-1/stop'
      );
    });
  });

  describe('restart', () => {
    it('should call POST to restart endpoint', async () => {
      mockClient.post.mockResolvedValue(undefined);

      await api.restart('env-1', 'project-1');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-1/projects/project-1/restart'
      );
    });
  });

  describe('redeploy', () => {
    it('should call POST to redeploy endpoint', async () => {
      mockClient.post.mockResolvedValue(undefined);

      await api.redeploy('env-1', 'project-1');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-1/projects/project-1/redeploy'
      );
    });
  });

  describe('pullImages', () => {
    it('should call POST to pull endpoint', async () => {
      mockClient.post.mockResolvedValue(undefined);

      await api.pullImages('env-1', 'project-1');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-1/projects/project-1/pull'
      );
    });
  });

  describe('getCounts', () => {
    it('should call /counts endpoint', async () => {
      mockClient.get.mockResolvedValue({ data: mockStatusCounts });

      const result = await api.getCounts('env-1');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/environments/env-1/projects/counts'
      );
      expect(result).toEqual(mockStatusCounts);
    });
  });
});
