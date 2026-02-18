import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemApi } from './system.js';
import { ArcaneClient } from './client.js';
import type { SystemInfo, DockerInfo, PruneResult, HealthStatus, VersionInfo } from '../types/system.js';

describe('SystemApi', () => {
  let mockClient: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };
  let systemApi: SystemApi;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
    };
    systemApi = new SystemApi(mockClient as unknown as ArcaneClient);
  });

  describe('getInfo', () => {
    it('should call GET /api/system/info and return system info', async () => {
      const mockSystemInfo: SystemInfo = {
        version: '1.0.0',
        uptime: 86400,
        environmentCount: 3,
        containerCount: 15,
        imageCount: 42,
        volumeCount: 8,
        networkCount: 5,
      };

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockSystemInfo,
      });

      const result = await systemApi.getInfo();

      expect(mockClient.get).toHaveBeenCalledWith('/api/system/info');
      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSystemInfo);
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('Network error');
      mockClient.get.mockRejectedValueOnce(error);

      await expect(systemApi.getInfo()).rejects.toThrow('Network error');
      expect(mockClient.get).toHaveBeenCalledWith('/api/system/info');
    });
  });

  describe('getDockerInfo', () => {
    it('should call GET /api/environments/{environmentId}/docker/info and return docker info', async () => {
      const environmentId = 'env-123';
      const mockDockerInfo: DockerInfo = {
        containers: 15,
        containersRunning: 10,
        containersStopped: 5,
        images: 42,
        memTotal: 16777216,
        operatingSystem: 'Ubuntu 22.04 LTS',
        architecture: 'x86_64',
        kernelVersion: '5.15.0',
        dockerVersion: '24.0.5',
      };

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockDockerInfo,
      });

      const result = await systemApi.getDockerInfo(environmentId);

      expect(mockClient.get).toHaveBeenCalledWith('/api/environments/env-123/docker/info');
      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDockerInfo);
    });

    it('should handle different environment IDs', async () => {
      const environmentId = 'production-env';
      const mockDockerInfo: DockerInfo = {
        containers: 0,
        containersRunning: 0,
        containersStopped: 0,
        images: 0,
        memTotal: 0,
        operatingSystem: '',
        architecture: '',
        kernelVersion: '',
        dockerVersion: '',
      };

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockDockerInfo,
      });

      await systemApi.getDockerInfo(environmentId);

      expect(mockClient.get).toHaveBeenCalledWith('/api/environments/production-env/docker/info');
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('Environment not found');
      mockClient.get.mockRejectedValueOnce(error);

      await expect(systemApi.getDockerInfo('invalid-id')).rejects.toThrow('Environment not found');
    });
  });

  describe('prune', () => {
    it('should call POST /api/environments/{environmentId}/system/prune and return prune result', async () => {
      const environmentId = 'env-456';
      const mockPruneResult: PruneResult = {
        containersDeleted: ['container-1', 'container-2'],
        imagesDeleted: ['image-1'],
        volumesDeleted: [],
        networksDeleted: ['network-1'],
        spaceReclaimed: 1073741824,
      };

      mockClient.post.mockResolvedValueOnce({
        success: true,
        data: mockPruneResult,
      });

      const result = await systemApi.prune(environmentId);

      expect(mockClient.post).toHaveBeenCalledWith('/api/environments/env-456/system/prune');
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPruneResult);
    });

    it('should handle empty prune result', async () => {
      const environmentId = 'env-789';
      const mockPruneResult: PruneResult = {
        containersDeleted: [],
        imagesDeleted: [],
        volumesDeleted: [],
        networksDeleted: [],
        spaceReclaimed: 0,
      };

      mockClient.post.mockResolvedValueOnce({
        success: true,
        data: mockPruneResult,
      });

      const result = await systemApi.prune(environmentId);

      expect(mockClient.post).toHaveBeenCalledWith('/api/environments/env-789/system/prune');
      expect(result).toEqual(mockPruneResult);
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('Prune failed');
      mockClient.post.mockRejectedValueOnce(error);

      await expect(systemApi.prune('env-error')).rejects.toThrow('Prune failed');
    });
  });

  describe('getHealth', () => {
    it('should call GET /api/health and return health status', async () => {
      const mockHealthStatus: HealthStatus = {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00Z',
      };

      mockClient.get.mockResolvedValueOnce(mockHealthStatus);

      const result = await systemApi.getHealth();

      expect(mockClient.get).toHaveBeenCalledWith('/api/health');
      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHealthStatus);
    });

    it('should handle unhealthy status', async () => {
      const mockHealthStatus: HealthStatus = {
        status: 'unhealthy',
        timestamp: '2024-01-15T10:30:00Z',
      };

      mockClient.get.mockResolvedValueOnce(mockHealthStatus);

      const result = await systemApi.getHealth();

      expect(mockClient.get).toHaveBeenCalledWith('/api/health');
      expect(result.status).toBe('unhealthy');
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('Health check failed');
      mockClient.get.mockRejectedValueOnce(error);

      await expect(systemApi.getHealth()).rejects.toThrow('Health check failed');
    });
  });

  describe('getVersion', () => {
    it('should call GET /api/system/version and return version info', async () => {
      const mockVersionInfo: VersionInfo = {
        version: '2.1.0',
        commit: 'abc123def456',
        buildDate: '2024-01-15T10:00:00Z',
      };

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockVersionInfo,
      });

      const result = await systemApi.getVersion();

      expect(mockClient.get).toHaveBeenCalledWith('/api/system/version');
      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockVersionInfo);
    });

    it('should handle different version formats', async () => {
      const mockVersionInfo: VersionInfo = {
        version: 'v3.0.0-beta.1',
        commit: 'feature-branch-commit',
        buildDate: '2024-06-01T00:00:00Z',
      };

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockVersionInfo,
      });

      const result = await systemApi.getVersion();

      expect(mockClient.get).toHaveBeenCalledWith('/api/system/version');
      expect(result.version).toBe('v3.0.0-beta.1');
      expect(result.commit).toBe('feature-branch-commit');
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('Version endpoint unavailable');
      mockClient.get.mockRejectedValueOnce(error);

      await expect(systemApi.getVersion()).rejects.toThrow('Version endpoint unavailable');
    });
  });
});
