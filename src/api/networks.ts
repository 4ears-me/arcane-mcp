import { ArcaneClient } from './client.js';
import type { ApiResponse, PaginationParams } from '../types/index.js';
import type { NetworkSummary, NetworkDetails, CreateNetwork } from '../types/network.js';

export class NetworksApi {
  constructor(private client: ArcaneClient) {}

  async list(environmentId: string, params?: PaginationParams): Promise<NetworkSummary[]> {
    const response = await this.client.get<ApiResponse<NetworkSummary[]>>(
      `/api/environments/${environmentId}/networks`,
      params
    );
    return response.data;
  }

  async get(environmentId: string, networkId: string): Promise<NetworkDetails> {
    const response = await this.client.get<ApiResponse<NetworkDetails>>(
      `/api/environments/${environmentId}/networks/${networkId}`
    );
    return response.data;
  }

  async create(environmentId: string, data: CreateNetwork): Promise<NetworkDetails> {
    const response = await this.client.post<ApiResponse<NetworkDetails>>(
      `/api/environments/${environmentId}/networks`,
      data
    );
    return response.data;
  }

  async remove(environmentId: string, networkId: string): Promise<void> {
    await this.client.delete(`/api/environments/${environmentId}/networks/${networkId}`);
  }

  async prune(environmentId: string): Promise<{ deleted: string[] }> {
    const response = await this.client.post<ApiResponse<{ deleted: string[] }>>(
      `/api/environments/${environmentId}/networks/prune`
    );
    return response.data;
  }
}