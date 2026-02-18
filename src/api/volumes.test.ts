import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VolumesApi } from './volumes.js';
import { ArcaneClient } from './client.js';
import type { VolumeSummary, VolumeDetails, VolumeBackup, FileEntry } from '../types/volume.js';
import type { ApiResponse, PaginationParams } from '../types/index.js';

vi.mock('./client.js');

describe('VolumesApi', () => {
  let volumesApi: VolumesApi;
  let mockClient: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    };
    volumesApi = new VolumesApi(mockClient as unknown as ArcaneClient);
  });

  const environmentId = 'env-123';
  const volumeName = 'my-volume';

  describe('list', () => {
    it('calls correct endpoint without params', async () => {
      const mockVolumes: VolumeSummary[] = [
        { name: 'vol1', driver: 'local', scope: 'local', createdAt: '2024-01-01' },
        { name: 'vol2', driver: 'local', scope: 'local', createdAt: '2024-01-02' },
      ];
      mockClient.get.mockResolvedValueOnce({ success: true, data: mockVolumes });

      const result = await volumesApi.list(environmentId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes`,
        undefined
      );
      expect(result).toEqual(mockVolumes);
    });

    it('calls correct endpoint with pagination params', async () => {
      const mockVolumes: VolumeSummary[] = [];
      const params: PaginationParams = { limit: 10, start: 0, search: 'test' };
      mockClient.get.mockResolvedValueOnce({ success: true, data: mockVolumes });

      await volumesApi.list(environmentId, params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes`,
        params
      );
    });
  });

  describe('get', () => {
    it('calls correct endpoint with volumeName', async () => {
      const mockVolume: VolumeDetails = {
        name: volumeName,
        driver: 'local',
        scope: 'local',
        createdAt: '2024-01-01',
        environmentId,
        mountpoint: '/var/lib/docker/volumes/my-volume/_data',
        labels: {},
        options: {},
      };
      mockClient.get.mockResolvedValueOnce({ success: true, data: mockVolume });

      const result = await volumesApi.get(environmentId, volumeName);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}`
      );
      expect(result).toEqual(mockVolume);
    });

    it('encodes special characters in volume name', async () => {
      const specialName = 'my/volume name';
      const mockVolume: VolumeDetails = {
        name: specialName,
        driver: 'local',
        scope: 'local',
        createdAt: '2024-01-01',
        environmentId,
        mountpoint: '/var/lib/docker/volumes/my-volume/_data',
        labels: {},
        options: {},
      };
      mockClient.get.mockResolvedValueOnce({ success: true, data: mockVolume });

      await volumesApi.get(environmentId, specialName);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(specialName)}`
      );
    });
  });

  describe('create', () => {
    it('calls POST with volume data', async () => {
      const createData = {
        name: 'new-volume',
        driver: 'local',
        labels: { app: 'test' },
      };
      const mockVolume: VolumeDetails = {
        name: 'new-volume',
        driver: 'local',
        scope: 'local',
        createdAt: '2024-01-01',
        environmentId,
        mountpoint: '/var/lib/docker/volumes/new-volume/_data',
        labels: { app: 'test' },
        options: {},
      };
      mockClient.post.mockResolvedValueOnce({ success: true, data: mockVolume });

      const result = await volumesApi.create(environmentId, createData);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes`,
        createData
      );
      expect(result).toEqual(mockVolume);
    });
  });

  describe('remove', () => {
    it('calls DELETE with correct endpoint', async () => {
      mockClient.delete.mockResolvedValueOnce(undefined);

      await volumesApi.remove(environmentId, volumeName);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}`
      );
    });

    it('encodes special characters in volume name', async () => {
      const specialName = 'my/volume';
      mockClient.delete.mockResolvedValueOnce(undefined);

      await volumesApi.remove(environmentId, specialName);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(specialName)}`
      );
    });
  });

  describe('prune', () => {
    it('calls POST to /prune endpoint', async () => {
      const pruneResult = { deleted: ['vol1', 'vol2'], spaceReclaimed: 1024 };
      mockClient.post.mockResolvedValueOnce({ success: true, data: pruneResult });

      const result = await volumesApi.prune(environmentId);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/prune`
      );
      expect(result).toEqual(pruneResult);
    });
  });

  describe('browse', () => {
    it('calls /browse without path param', async () => {
      const mockEntries: FileEntry[] = [
        { name: 'file1.txt', path: '/file1.txt', isDir: false, size: 100, modifiedAt: '2024-01-01' },
        { name: 'dir1', path: '/dir1', isDir: true, size: 0, modifiedAt: '2024-01-01' },
      ];
      mockClient.get.mockResolvedValueOnce({ success: true, data: mockEntries });

      const result = await volumesApi.browse(environmentId, volumeName);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/browse`,
        undefined
      );
      expect(result).toEqual(mockEntries);
    });

    it('calls /browse with path param', async () => {
      const mockEntries: FileEntry[] = [
        { name: 'file2.txt', path: '/subdir/file2.txt', isDir: false, size: 200, modifiedAt: '2024-01-01' },
      ];
      const path = '/subdir';
      mockClient.get.mockResolvedValueOnce({ success: true, data: mockEntries });

      const result = await volumesApi.browse(environmentId, volumeName, path);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/browse`,
        { path }
      );
      expect(result).toEqual(mockEntries);
    });
  });

  describe('getFileContent', () => {
    it('calls /file endpoint with path query param', async () => {
      const fileContent = 'Hello, World!';
      const filePath = '/path/to/file.txt';
      mockClient.get.mockResolvedValueOnce({ success: true, data: fileContent });

      const result = await volumesApi.getFileContent(environmentId, volumeName, filePath);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/file`,
        { path: filePath }
      );
      expect(result).toEqual(fileContent);
    });
  });

  describe('getSizes', () => {
    it('calls /sizes endpoint', async () => {
      const mockSizes: Record<string, number> = {
        'vol1': 1024,
        'vol2': 2048,
      };
      mockClient.get.mockResolvedValueOnce({ success: true, data: mockSizes });

      const result = await volumesApi.getSizes(environmentId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/sizes`
      );
      expect(result).toEqual(mockSizes);
    });
  });

  describe('listBackups', () => {
    it('calls /backups endpoint', async () => {
      const mockBackups: VolumeBackup[] = [
        { id: 'backup-1', volumeName, size: 1024, createdAt: '2024-01-01', status: 'completed' },
        { id: 'backup-2', volumeName, size: 2048, createdAt: '2024-01-02', status: 'completed' },
      ];
      mockClient.get.mockResolvedValueOnce({ success: true, data: mockBackups });

      const result = await volumesApi.listBackups(environmentId, volumeName);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/backups`
      );
      expect(result).toEqual(mockBackups);
    });
  });

  describe('createBackup', () => {
    it('calls POST to /backups endpoint', async () => {
      const mockBackup: VolumeBackup = {
        id: 'backup-1',
        volumeName,
        size: 1024,
        createdAt: '2024-01-01',
        status: 'in_progress',
      };
      mockClient.post.mockResolvedValueOnce({ success: true, data: mockBackup });

      const result = await volumesApi.createBackup(environmentId, volumeName);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/backups`
      );
      expect(result).toEqual(mockBackup);
    });
  });

  describe('restoreBackup', () => {
    it('calls POST to /backups/{id}/restore endpoint', async () => {
      const backupId = 'backup-1';
      mockClient.post.mockResolvedValueOnce(undefined);

      await volumesApi.restoreBackup(environmentId, volumeName, backupId);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/backups/${backupId}/restore`
      );
    });

    it('encodes volume name in restore endpoint', async () => {
      const specialName = 'my/volume';
      const backupId = 'backup-1';
      mockClient.post.mockResolvedValueOnce(undefined);

      await volumesApi.restoreBackup(environmentId, specialName, backupId);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/volumes/${encodeURIComponent(specialName)}/backups/${backupId}/restore`
      );
    });
  });
});