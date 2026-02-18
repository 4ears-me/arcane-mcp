import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContainersApi } from './containers.js';
import type { ArcaneClient } from './client.js';
import type { ContainerSummary, ContainerDetails, CreateContainer, ContainerStatusCounts } from '../types/container.js';
import type { ApiResponse, PaginationParams } from '../types/index.js';

describe('ContainersApi', () => {
  let mockClient: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let containersApi: ContainersApi;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    };
    containersApi = new ContainersApi(mockClient as unknown as ArcaneClient);
  });

  describe('list', () => {
    it('calls correct endpoint with environmentId', async () => {
      const mockContainers: ContainerSummary[] = [
        { id: 'container-1', name: 'web', image: 'nginx:latest', status: 'Up 2 hours', state: 'running', createdAt: '2024-01-01T00:00:00Z', ports: [], labels: {} },
        { id: 'container-2', name: 'db', image: 'postgres:15', status: 'Up 2 hours', state: 'running', createdAt: '2024-01-01T00:00:00Z', ports: [], labels: {} },
      ];
      mockClient.get.mockResolvedValueOnce({ data: mockContainers });

      const result = await containersApi.list('env-123');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/environments/env-123/containers',
        undefined
      );
      expect(result).toEqual(mockContainers);
    });

    it('calls correct endpoint with environmentId and pagination params', async () => {
      const mockContainers: ContainerSummary[] = [];
      const params: PaginationParams = { start: 10, limit: 10 };
      mockClient.get.mockResolvedValueOnce({ data: mockContainers });

      const result = await containersApi.list('env-456', params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/environments/env-456/containers',
        params
      );
      expect(result).toEqual(mockContainers);
    });
  });

  describe('get', () => {
    it('calls correct endpoint with environmentId and containerId', async () => {
      const mockContainer: ContainerDetails = {
        id: 'container-1',
        name: 'web',
        image: 'nginx:latest',
        status: 'Up 2 hours',
        state: 'running',
        createdAt: '2024-01-01T00:00:00Z',
        ports: [],
        labels: {},
        environmentId: 'env-123',
        command: '/bin/bash',
        environmentVars: [],
        mounts: [],
        networks: [],
        restartPolicy: 'always',
        created: '2024-01-01T00:00:00Z',
      };
      mockClient.get.mockResolvedValueOnce({ data: mockContainer });

      const result = await containersApi.get('env-123', 'container-1');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/environments/env-123/containers/container-1'
      );
      expect(result).toEqual(mockContainer);
    });
  });

  describe('create', () => {
    it('calls POST with container data', async () => {
      const createData: CreateContainer = {
        image: 'nginx:latest',
        name: 'web-server',
        environment: { NODE_ENV: 'production' },
        ports: [{ containerPort: 80, hostPort: 8080 }],
      };
      const mockContainer: ContainerDetails = {
        id: 'new-container',
        name: 'web-server',
        image: 'nginx:latest',
        status: 'Created',
        state: 'created',
        createdAt: '2024-01-01T00:00:00Z',
        ports: [{ containerPort: 80, hostPort: 8080 }],
        labels: {},
        environmentId: 'env-123',
        command: '/bin/bash',
        environmentVars: ['NODE_ENV=production'],
        mounts: [],
        networks: [],
        restartPolicy: 'no',
        created: '2024-01-01T00:00:00Z',
      };
      mockClient.post.mockResolvedValueOnce({ data: mockContainer });

      const result = await containersApi.create('env-123', createData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-123/containers',
        createData
      );
      expect(result).toEqual(mockContainer);
    });

    it('calls POST with minimal container data', async () => {
      const createData: CreateContainer = {
        image: 'alpine:latest',
      };
      const mockContainer: ContainerDetails = {
        id: 'new-container',
        name: 'alpine-container',
        image: 'alpine:latest',
        status: 'Created',
        state: 'created',
        createdAt: '2024-01-01T00:00:00Z',
        ports: [],
        labels: {},
        environmentId: 'env-789',
        command: '/bin/sh',
        environmentVars: [],
        mounts: [],
        networks: [],
        restartPolicy: 'no',
        created: '2024-01-01T00:00:00Z',
      };
      mockClient.post.mockResolvedValueOnce({ data: mockContainer });

      const result = await containersApi.create('env-789', createData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-789/containers',
        createData
      );
      expect(result).toEqual(mockContainer);
    });
  });

  describe('start', () => {
    it('calls POST to /start endpoint', async () => {
      mockClient.post.mockResolvedValueOnce(undefined);

      await containersApi.start('env-123', 'container-1');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-123/containers/container-1/start'
      );
    });
  });

  describe('stop', () => {
    it('calls POST to /stop endpoint', async () => {
      mockClient.post.mockResolvedValueOnce(undefined);

      await containersApi.stop('env-123', 'container-1');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-123/containers/container-1/stop'
      );
    });
  });

  describe('restart', () => {
    it('calls POST to /restart endpoint', async () => {
      mockClient.post.mockResolvedValueOnce(undefined);

      await containersApi.restart('env-123', 'container-1');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/environments/env-123/containers/container-1/restart'
      );
    });
  });

  describe('delete', () => {
    it('calls DELETE endpoint', async () => {
      mockClient.delete.mockResolvedValueOnce(undefined);

      await containersApi.delete('env-123', 'container-1');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/api/environments/env-123/containers/container-1'
      );
    });
  });

  describe('getCounts', () => {
    it('calls /counts endpoint', async () => {
      const mockCounts: ContainerStatusCounts = {
        running: 5,
        exited: 2,
        paused: 1,
        total: 8,
      };
      mockClient.get.mockResolvedValueOnce({ data: mockCounts });

      const result = await containersApi.getCounts('env-123');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/environments/env-123/containers/counts'
      );
      expect(result).toEqual(mockCounts);
    });
  });
});
