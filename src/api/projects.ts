import { ArcaneClient } from './client.js';
import type { ApiResponse, PaginationParams } from '../types/index.js';
import type { ProjectSummary, ProjectDetails, CreateProject, ProjectStatusCounts } from '../types/project.js';

export class ProjectsApi {
  constructor(private client: ArcaneClient) {}

  async list(environmentId: string, params?: PaginationParams): Promise<ProjectSummary[]> {
    const response = await this.client.get<ApiResponse<ProjectSummary[]>>(
      `/api/environments/${environmentId}/projects`,
      params
    );
    return response.data;
  }

  async get(environmentId: string, projectId: string): Promise<ProjectDetails> {
    const response = await this.client.get<ApiResponse<ProjectDetails>>(
      `/api/environments/${environmentId}/projects/${projectId}`
    );
    return response.data;
  }

  async create(environmentId: string, data: CreateProject): Promise<ProjectDetails> {
    const response = await this.client.post<ApiResponse<ProjectDetails>>(
      `/api/environments/${environmentId}/projects`,
      data
    );
    return response.data;
  }

  async update(environmentId: string, projectId: string, data: Partial<CreateProject>): Promise<ProjectDetails> {
    const response = await this.client.put<ApiResponse<ProjectDetails>>(
      `/api/environments/${environmentId}/projects/${projectId}`,
      data
    );
    return response.data;
  }

  async delete(environmentId: string, projectId: string): Promise<void> {
    await this.client.delete(`/api/environments/${environmentId}/projects/${projectId}`);
  }

  async deploy(environmentId: string, projectId: string): Promise<void> {
    await this.client.post(`/api/environments/${environmentId}/projects/${projectId}/deploy`);
  }

  async stop(environmentId: string, projectId: string): Promise<void> {
    await this.client.post(`/api/environments/${environmentId}/projects/${projectId}/stop`);
  }

  async restart(environmentId: string, projectId: string): Promise<void> {
    await this.client.post(`/api/environments/${environmentId}/projects/${projectId}/restart`);
  }

  async redeploy(environmentId: string, projectId: string): Promise<void> {
    await this.client.post(`/api/environments/${environmentId}/projects/${projectId}/redeploy`);
  }

  async pullImages(environmentId: string, projectId: string): Promise<void> {
    await this.client.post(`/api/environments/${environmentId}/projects/${projectId}/pull`);
  }

  async getCounts(environmentId: string): Promise<ProjectStatusCounts> {
    const response = await this.client.get<ApiResponse<ProjectStatusCounts>>(
      `/api/environments/${environmentId}/projects/counts`
    );
    return response.data;
  }
}