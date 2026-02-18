import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworksApi } from './networks.js';
import type { ArcaneClient } from './client.js';
import type { NetworkSummary, NetworkDetails, CreateNetwork } from '../types/network.js';

describe('NetworksApi', () => {
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let networksApi: NetworksApi;

  const environmentId = 'env-123';

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    };
    networksApi = new NetworksApi(mockClient as unknown as ArcaneClient);
  });

  describe('list', () => {
    it('should call GET with correct endpoint', async () => {
      const mockNetworks: NetworkSummary[] = [
        {
          id: 'network-1',
          name: 'bridge',
          driver: 'bridge',
          scope: 'local',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'network-2',
          name: 'custom-network',
          driver: 'bridge',
          scope: 'local',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      mockClient.get.mockResolvedValue({ data: mockNetworks });

      const result = await networksApi.list(environmentId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/networks`,
        undefined
      );
      expect(result).toEqual(mockNetworks);
    });

    it('should call GET with pagination params', async () => {
      const mockNetworks: NetworkSummary[] = [];
      const params = { page: 1, limit: 10 };

      mockClient.get.mockResolvedValue({ data: mockNetworks });

      const result = await networksApi.list(environmentId, params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/networks`,
        params
      );
      expect(result).toEqual(mockNetworks);
    });
  });

  describe('get', () => {
    it('should call GET with correct endpoint and networkId', async () => {
      const networkId = 'network-456';
      const mockNetworkDetails: NetworkDetails = {
        id: networkId,
        name: 'my-network',
        driver: 'bridge',
        scope: 'local',
        createdAt: '2024-01-01T00:00:00Z',
        environmentId: environmentId,
        subnet: '172.18.0.0/16',
        gateway: '172.18.0.1',
        labels: { 'com.docker.compose.network': 'my-network' },
        containers: {
          'container-1': { name: 'web', ipAddress: '172.18.0.2' },
        },
      };

      mockClient.get.mockResolvedValue({ data: mockNetworkDetails });

      const result = await networksApi.get(environmentId, networkId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/networks/${networkId}`
      );
      expect(result).toEqual(mockNetworkDetails);
    });
  });

  describe('create', () => {
    it('should call POST with correct endpoint and network data', async () => {
      const createData: CreateNetwork = {
        name: 'new-network',
        driver: 'bridge',
        subnet: '172.20.0.0/16',
        gateway: '172.20.0.1',
        labels: { environment: 'development' },
      };

      const mockCreatedNetwork: NetworkDetails = {
        id: 'network-new',
        name: createData.name,
        driver: createData.driver!,
        scope: 'local',
        createdAt: '2024-01-03T00:00:00Z',
        environmentId: environmentId,
        subnet: createData.subnet!,
        gateway: createData.gateway!,
        labels: createData.labels!,
        containers: {},
      };

      mockClient.post.mockResolvedValue({ data: mockCreatedNetwork });

      const result = await networksApi.create(environmentId, createData);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/networks`,
        createData
      );
      expect(result).toEqual(mockCreatedNetwork);
    });

    it('should call POST with minimal data (only name)', async () => {
      const createData: CreateNetwork = {
        name: 'simple-network',
      };

      const mockCreatedNetwork: NetworkDetails = {
        id: 'network-simple',
        name: createData.name,
        driver: 'bridge',
        scope: 'local',
        createdAt: '2024-01-03T00:00:00Z',
        environmentId: environmentId,
        subnet: '',
        gateway: '',
        labels: {},
        containers: {},
      };

      mockClient.post.mockResolvedValue({ data: mockCreatedNetwork });

      const result = await networksApi.create(environmentId, createData);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/networks`,
        createData
      );
      expect(result).toEqual(mockCreatedNetwork);
    });
  });

  describe('remove', () => {
    it('should call DELETE with correct endpoint', async () => {
      const networkId = 'network-to-remove';

      mockClient.delete.mockResolvedValue(undefined);

      await networksApi.remove(environmentId, networkId);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/networks/${networkId}`
      );
    });
  });

  describe('prune', () => {
    it('should call POST to /prune endpoint', async () => {
      const mockPruneResult = {
        deleted: ['unused-network-1', 'unused-network-2'],
      };

      mockClient.post.mockResolvedValue({ data: mockPruneResult });

      const result = await networksApi.prune(environmentId);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/networks/prune`
      );
      expect(result).toEqual(mockPruneResult);
    });

    it('should return empty deleted array when no networks pruned', async () => {
      const mockPruneResult = {
        deleted: [],
      };

      mockClient.post.mockResolvedValue({ data: mockPruneResult });

      const result = await networksApi.prune(environmentId);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/networks/prune`
      );
      expect(result).toEqual(mockPruneResult);
    });
  });
});
