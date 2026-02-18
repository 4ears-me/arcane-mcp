import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnvironmentsApi } from './environments.js';
import type { ArcaneClient } from './client.js';
import type { Environment, CreateEnvironment, UpdateEnvironment } from '../types/environment.js';
import type { ApiResponse, PaginationParams } from '../types/common.js';

describe('EnvironmentsApi', () => {
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let api: EnvironmentsApi;

  const mockEnvironment: Environment = {
    id: 'env-123',
    name: 'Production',
    description: 'Production environment',
    url: 'https://prod.example.com',
    status: 'online',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    api = new EnvironmentsApi(mockClient as unknown as ArcaneClient);
  });

  describe('list', () => {
    it('calls correct endpoint without params', async () => {
      const response: ApiResponse<Environment[]> = {
        success: true,
        data: [mockEnvironment],
      };
      mockClient.get.mockResolvedValue(response);

      const result = await api.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/environments', undefined);
      expect(result).toEqual([mockEnvironment]);
    });

    it('calls correct endpoint with pagination params', async () => {
      const params: PaginationParams = {
        search: 'prod',
        sort: 'name',
        order: 'asc',
        start: 0,
        limit: 10,
      };
      const response: ApiResponse<Environment[]> = {
        success: true,
        data: [mockEnvironment],
        pagination: { total: 1, start: 0, limit: 10 },
      };
      mockClient.get.mockResolvedValue(response);

      const result = await api.list(params);

      expect(mockClient.get).toHaveBeenCalledWith('/api/environments', params);
      expect(result).toEqual([mockEnvironment]);
    });

    it('returns empty array when no environments', async () => {
      const response: ApiResponse<Environment[]> = {
        success: true,
        data: [],
      };
      mockClient.get.mockResolvedValue(response);

      const result = await api.list();

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('calls correct endpoint with id', async () => {
      const response: ApiResponse<Environment> = {
        success: true,
        data: mockEnvironment,
      };
      mockClient.get.mockResolvedValue(response);

      const result = await api.get('env-123');

      expect(mockClient.get).toHaveBeenCalledWith('/api/environments/env-123');
      expect(result).toEqual(mockEnvironment);
    });

    it('calls correct endpoint with different id', async () => {
      const anotherEnv: Environment = {
        ...mockEnvironment,
        id: 'env-456',
        name: 'Development',
      };
      const response: ApiResponse<Environment> = {
        success: true,
        data: anotherEnv,
      };
      mockClient.get.mockResolvedValue(response);

      const result = await api.get('env-456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/environments/env-456');
      expect(result).toEqual(anotherEnv);
    });
  });

  describe('create', () => {
    it('calls POST with correct data', async () => {
      const createData: CreateEnvironment = {
        name: 'Staging',
        description: 'Staging environment',
        url: 'https://staging.example.com',
      };
      const createdEnv: Environment = {
        id: 'env-new',
        ...createData,
        status: 'online',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      };
      const response: ApiResponse<Environment> = {
        success: true,
        data: createdEnv,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await api.create(createData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/environments', createData);
      expect(result).toEqual(createdEnv);
    });

    it('calls POST with minimal required data', async () => {
      const createData: CreateEnvironment = {
        name: 'Minimal',
        url: 'https://minimal.example.com',
      };
      const createdEnv: Environment = {
        id: 'env-minimal',
        name: 'Minimal',
        url: 'https://minimal.example.com',
        status: 'offline',
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      };
      const response: ApiResponse<Environment> = {
        success: true,
        data: createdEnv,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await api.create(createData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/environments', createData);
      expect(result).toEqual(createdEnv);
    });
  });

  describe('update', () => {
    it('calls PUT with correct id and data', async () => {
      const updateData: UpdateEnvironment = {
        name: 'Production Updated',
        description: 'Updated description',
      };
      const updatedEnv: Environment = {
        ...mockEnvironment,
        ...updateData,
        updatedAt: '2024-01-05T00:00:00Z',
      };
      const response: ApiResponse<Environment> = {
        success: true,
        data: updatedEnv,
      };
      mockClient.put.mockResolvedValue(response);

      const result = await api.update('env-123', updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/api/environments/env-123', updateData);
      expect(result).toEqual(updatedEnv);
    });

    it('calls PUT with partial update data', async () => {
      const updateData: UpdateEnvironment = {
        url: 'https://new-url.example.com',
      };
      const updatedEnv: Environment = {
        ...mockEnvironment,
        url: 'https://new-url.example.com',
        updatedAt: '2024-01-05T00:00:00Z',
      };
      const response: ApiResponse<Environment> = {
        success: true,
        data: updatedEnv,
      };
      mockClient.put.mockResolvedValue(response);

      const result = await api.update('env-123', updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/api/environments/env-123', updateData);
      expect(result).toEqual(updatedEnv);
    });

    it('calls PUT with different id', async () => {
      const updateData: UpdateEnvironment = {
        name: 'Development Updated',
      };
      const updatedEnv: Environment = {
        ...mockEnvironment,
        id: 'env-789',
        name: 'Development Updated',
        updatedAt: '2024-01-05T00:00:00Z',
      };
      const response: ApiResponse<Environment> = {
        success: true,
        data: updatedEnv,
      };
      mockClient.put.mockResolvedValue(response);

      const result = await api.update('env-789', updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/api/environments/env-789', updateData);
      expect(result).toEqual(updatedEnv);
    });
  });

  describe('delete', () => {
    it('calls DELETE with correct id', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await api.delete('env-123');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/environments/env-123');
    });

    it('calls DELETE with different id', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await api.delete('env-456');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/environments/env-456');
    });

    it('returns void on successful delete', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      const result = await api.delete('env-123');

      expect(result).toBeUndefined();
    });
  });

  describe('testConnection', () => {
    it('calls POST to test endpoint with id', async () => {
      const testResult = { success: true, message: 'Connection successful' };
      const response: ApiResponse<{ success: boolean; message: string }> = {
        success: true,
        data: testResult,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await api.testConnection('env-123');

      expect(mockClient.post).toHaveBeenCalledWith('/api/environments/env-123/test');
      expect(result).toEqual(testResult);
    });

    it('returns failed connection result', async () => {
      const testResult = { success: false, message: 'Connection failed: timeout' };
      const response: ApiResponse<{ success: boolean; message: string }> = {
        success: true,
        data: testResult,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await api.testConnection('env-456');

      expect(mockClient.post).toHaveBeenCalledWith('/api/environments/env-456/test');
      expect(result).toEqual(testResult);
    });

    it('calls test endpoint with different id', async () => {
      const testResult = { success: true, message: 'Environment reachable' };
      const response: ApiResponse<{ success: boolean; message: string }> = {
        success: true,
        data: testResult,
      };
      mockClient.post.mockResolvedValue(response);

      const result = await api.testConnection('env-789');

      expect(mockClient.post).toHaveBeenCalledWith('/api/environments/env-789/test');
      expect(result).toEqual(testResult);
    });
  });
});