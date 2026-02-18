import { ArcaneClient } from './client.js';
import type { ApiResponse, PaginationParams } from '../types/index.js';
import type { Environment, CreateEnvironment, UpdateEnvironment } from '../types/environment.js';

export class EnvironmentsApi {
  constructor(private client: ArcaneClient) {}

  async list(params?: PaginationParams): Promise<Environment[]> {
    const response = await this.client.get<ApiResponse<Environment[]>>('/api/environments', params);
    return response.data;
  }

  async get(id: string): Promise<Environment> {
    const response = await this.client.get<ApiResponse<Environment>>(`/api/environments/${id}`);
    return response.data;
  }

  async create(data: CreateEnvironment): Promise<Environment> {
    const response = await this.client.post<ApiResponse<Environment>>('/api/environments', data);
    return response.data;
  }

  async update(id: string, data: UpdateEnvironment): Promise<Environment> {
    const response = await this.client.put<ApiResponse<Environment>>(`/api/environments/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/environments/${id}`);
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<ApiResponse<{ success: boolean; message: string }>>(
      `/api/environments/${id}/test`
    );
    return response.data;
  }
}