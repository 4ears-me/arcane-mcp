import { ArcaneClient } from './client.js';
import type { ApiResponse, PaginationParams } from '../types/index.js';
import type { ImageSummary, ImageDetails, PullImageOptions, ImagePruneReport } from '../types/image.js';

export class ImagesApi {
  constructor(private client: ArcaneClient) {}

  async list(environmentId: string, params?: PaginationParams): Promise<ImageSummary[]> {
    const response = await this.client.get<ApiResponse<ImageSummary[]>>(
      `/api/environments/${environmentId}/images`,
      params
    );
    return response.data;
  }

  async get(environmentId: string, imageId: string): Promise<ImageDetails> {
    const response = await this.client.get<ApiResponse<ImageDetails>>(
      `/api/environments/${environmentId}/images/${imageId}`
    );
    return response.data;
  }

  async pull(environmentId: string, options: PullImageOptions): Promise<AsyncIterable<string>> {
    return this.client.postStream(`/api/environments/${environmentId}/images/pull`, options);
  }

  async remove(environmentId: string, imageId: string): Promise<void> {
    await this.client.delete(`/api/environments/${environmentId}/images/${imageId}`);
  }

  async prune(environmentId: string): Promise<ImagePruneReport> {
    const response = await this.client.post<ApiResponse<ImagePruneReport>>(
      `/api/environments/${environmentId}/images/prune`
    );
    return response.data;
  }

  async getCounts(environmentId: string): Promise<{ total: number; unused: number }> {
    const response = await this.client.get<ApiResponse<{ total: number; unused: number }>>(
      `/api/environments/${environmentId}/images/counts`
    );
    return response.data;
  }
}