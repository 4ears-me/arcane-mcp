import { ArcaneClient } from './client.js';
import type { ApiResponse, PaginationParams } from '../types/index.js';
import type { ContainerSummary, ContainerDetails, CreateContainer, ContainerStatusCounts } from '../types/container.js';

export class ContainersApi {
  constructor(private client: ArcaneClient) {}

  async list(environmentId: string, params?: PaginationParams): Promise<ContainerSummary[]> {
    const response = await this.client.get<ApiResponse<ContainerSummary[]>>(
      `/api/environments/${environmentId}/containers`,
      params
    );
    return response.data;
  }

  async get(environmentId: string, containerId: string): Promise<ContainerDetails> {
    const response = await this.client.get<ApiResponse<ContainerDetails>>(
      `/api/environments/${environmentId}/containers/${containerId}`
    );
    return response.data;
  }

  async create(environmentId: string, data: CreateContainer): Promise<ContainerDetails> {
    const response = await this.client.post<ApiResponse<ContainerDetails>>(
      `/api/environments/${environmentId}/containers`,
      data
    );
    return response.data;
  }

  async start(environmentId: string, containerId: string): Promise<void> {
    await this.client.post(`/api/environments/${environmentId}/containers/${containerId}/start`);
  }

  async stop(environmentId: string, containerId: string): Promise<void> {
    await this.client.post(`/api/environments/${environmentId}/containers/${containerId}/stop`);
  }

  async restart(environmentId: string, containerId: string): Promise<void> {
    await this.client.post(`/api/environments/${environmentId}/containers/${containerId}/restart`);
  }

  async delete(environmentId: string, containerId: string): Promise<void> {
    await this.client.delete(`/api/environments/${environmentId}/containers/${containerId}`);
  }

  async getCounts(environmentId: string): Promise<ContainerStatusCounts> {
    const response = await this.client.get<ApiResponse<ContainerStatusCounts>>(
      `/api/environments/${environmentId}/containers/counts`
    );
    return response.data;
  }
}