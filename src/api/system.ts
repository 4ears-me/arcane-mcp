import { ArcaneClient } from './client.js';
import type { ApiResponse } from '../types/index.js';
import type { SystemInfo, DockerInfo, PruneResult, HealthStatus, VersionInfo } from '../types/system.js';

export class SystemApi {
  constructor(private client: ArcaneClient) {}

  async getInfo(): Promise<SystemInfo> {
    const response = await this.client.get<ApiResponse<SystemInfo>>('/api/system/info');
    return response.data;
  }

  async getDockerInfo(environmentId: string): Promise<DockerInfo> {
    const response = await this.client.get<ApiResponse<DockerInfo>>(
      `/api/environments/${environmentId}/docker/info`
    );
    return response.data;
  }

  async prune(environmentId: string): Promise<PruneResult> {
    const response = await this.client.post<ApiResponse<PruneResult>>(
      `/api/environments/${environmentId}/system/prune`
    );
    return response.data;
  }

  async getHealth(): Promise<HealthStatus> {
    const response = await this.client.get<HealthStatus>('/api/health');
    return response;
  }

  async getVersion(): Promise<VersionInfo> {
    const response = await this.client.get<ApiResponse<VersionInfo>>('/api/system/version');
    return response.data;
  }
}