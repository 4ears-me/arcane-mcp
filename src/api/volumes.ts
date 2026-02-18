import { ArcaneClient } from './client.js';
import type { ApiResponse, PaginationParams } from '../types/index.js';
import type { VolumeSummary, VolumeDetails, CreateVolume, VolumeBackup, FileEntry } from '../types/volume.js';

export class VolumesApi {
  constructor(private client: ArcaneClient) {}

  async list(environmentId: string, params?: PaginationParams): Promise<VolumeSummary[]> {
    const response = await this.client.get<ApiResponse<VolumeSummary[]>>(
      `/api/environments/${environmentId}/volumes`,
      params
    );
    return response.data;
  }

  async get(environmentId: string, volumeName: string): Promise<VolumeDetails> {
    const response = await this.client.get<ApiResponse<VolumeDetails>>(
      `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}`
    );
    return response.data;
  }

  async create(environmentId: string, data: CreateVolume): Promise<VolumeDetails> {
    const response = await this.client.post<ApiResponse<VolumeDetails>>(
      `/api/environments/${environmentId}/volumes`,
      data
    );
    return response.data;
  }

  async remove(environmentId: string, volumeName: string): Promise<void> {
    await this.client.delete(`/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}`);
  }

  async prune(environmentId: string): Promise<{ deleted: string[]; spaceReclaimed: number }> {
    const response = await this.client.post<ApiResponse<{ deleted: string[]; spaceReclaimed: number }>>(
      `/api/environments/${environmentId}/volumes/prune`
    );
    return response.data;
  }

  async browse(environmentId: string, volumeName: string, path?: string): Promise<FileEntry[]> {
    const response = await this.client.get<ApiResponse<FileEntry[]>>(
      `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/browse`,
      path ? { path } : undefined
    );
    return response.data;
  }

  async getFileContent(environmentId: string, volumeName: string, filePath: string): Promise<string> {
    const response = await this.client.get<ApiResponse<string>>(
      `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/file`,
      { path: filePath }
    );
    return response.data;
  }

  async getSizes(environmentId: string): Promise<Record<string, number>> {
    const response = await this.client.get<ApiResponse<Record<string, number>>>(
      `/api/environments/${environmentId}/volumes/sizes`
    );
    return response.data;
  }

  async listBackups(environmentId: string, volumeName: string): Promise<VolumeBackup[]> {
    const response = await this.client.get<ApiResponse<VolumeBackup[]>>(
      `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/backups`
    );
    return response.data;
  }

  async createBackup(environmentId: string, volumeName: string): Promise<VolumeBackup> {
    const response = await this.client.post<ApiResponse<VolumeBackup>>(
      `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/backups`
    );
    return response.data;
  }

  async restoreBackup(environmentId: string, volumeName: string, backupId: string): Promise<void> {
    await this.client.post(
      `/api/environments/${environmentId}/volumes/${encodeURIComponent(volumeName)}/backups/${backupId}/restore`
    );
  }
}