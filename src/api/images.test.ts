import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImagesApi } from './images.js';
import { ArcaneClient } from './client.js';
import type { ImageSummary, ImageDetails, PullImageOptions, ImagePruneReport } from '../types/image.js';
import type { ApiResponse, PaginationParams } from '../types/index.js';

vi.mock('./client.js');

describe('ImagesApi', () => {
  let imagesApi: ImagesApi;
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    postStream: ReturnType<typeof vi.fn>;
  };

  const environmentId = 'env-123';
  const imageId = 'sha256:abc123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      postStream: vi.fn(),
    };
    imagesApi = new ImagesApi(mockClient as unknown as ArcaneClient);
  });

  describe('list', () => {
    it('calls correct endpoint without params', async () => {
      const mockImages: ImageSummary[] = [
        {
          id: 'sha256:abc123',
          repoTags: ['nginx:latest'],
          repoDigests: ['nginx@sha256:xyz'],
          size: 142000000,
          created: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'sha256:def456',
          repoTags: ['redis:alpine'],
          repoDigests: ['redis@sha256:uvw'],
          size: 32000000,
          created: '2024-01-14T08:30:00Z',
          createdAt: '2024-01-14T08:30:00Z',
        },
      ];

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockImages,
      });

      const result = await imagesApi.list(environmentId);

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images`,
        undefined
      );
      expect(result).toEqual(mockImages);
    });

    it('calls correct endpoint with pagination params', async () => {
      const params: PaginationParams = {
        search: 'nginx',
        sort: 'size',
        order: 'desc',
        start: 0,
        limit: 10,
      };

      const mockImages: ImageSummary[] = [
        {
          id: 'sha256:abc123',
          repoTags: ['nginx:latest'],
          repoDigests: ['nginx@sha256:xyz'],
          size: 142000000,
          created: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-15T10:00:00Z',
        },
      ];

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockImages,
        pagination: { total: 1, start: 0, limit: 10 },
      });

      const result = await imagesApi.list(environmentId, params);

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images`,
        params
      );
      expect(result).toEqual(mockImages);
    });

    it('returns empty array when no images', async () => {
      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const result = await imagesApi.list(environmentId);

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('calls correct endpoint with imageId', async () => {
      const mockImage: ImageDetails = {
        id: imageId,
        environmentId,
        repoTags: ['nginx:latest'],
        repoDigests: ['nginx@sha256:xyz'],
        size: 142000000,
        created: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        architecture: 'amd64',
        os: 'linux',
        author: 'NGINX Docker Maintainers',
        labels: { maintainer: 'NGINX Docker Maintainers' },
        containerCount: 3,
      };

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockImage,
      });

      const result = await imagesApi.get(environmentId, imageId);

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images/${imageId}`
      );
      expect(result).toEqual(mockImage);
    });

    it('handles URL-encoded imageId', async () => {
      const complexImageId = 'sha256:abc123%20with%20spaces';

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          id: complexImageId,
          repoTags: [],
          repoDigests: [],
          size: 0,
          created: '',
          createdAt: '',
          environmentId,
          architecture: 'amd64',
          os: 'linux',
          author: '',
          labels: {},
          containerCount: 0,
        },
      });

      await imagesApi.get(environmentId, complexImageId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images/${complexImageId}`
      );
    });
  });

  describe('pull', () => {
    it('calls POST to /pull with options', async () => {
      const options: PullImageOptions = {
        image: 'nginx',
        tag: 'latest',
      };

      const mockStream = (async function* () {
        yield '{"status":"Pulling from library/nginx"}\n';
        yield '{"status":"Pulling fs layer"}\n';
        yield '{"status":"Download complete"}\n';
      })();

      mockClient.postStream.mockResolvedValueOnce(mockStream);

      const result = await imagesApi.pull(environmentId, options);

      expect(mockClient.postStream).toHaveBeenCalledTimes(1);
      expect(mockClient.postStream).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images/pull`,
        options
      );
      expect(result).toBe(mockStream);
    });

    it('calls POST to /pull with full options', async () => {
      const options: PullImageOptions = {
        image: 'myapp',
        registry: 'registry.example.com',
        tag: 'v1.2.3',
        platform: 'linux/arm64',
      };

      const mockStream = (async function* () {
        yield '{"status":"Pulling"}\n';
      })();

      mockClient.postStream.mockResolvedValueOnce(mockStream);

      const result = await imagesApi.pull(environmentId, options);

      expect(mockClient.postStream).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images/pull`,
        options
      );
      expect(result).toBeDefined();
    });

    it('returns async iterable that can be consumed', async () => {
      const options: PullImageOptions = { image: 'alpine' };
      const chunks = ['chunk1', 'chunk2', 'chunk3'];

      const mockStream = (async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      })();

      mockClient.postStream.mockResolvedValueOnce(mockStream);

      const result = await imagesApi.pull(environmentId, options);
      const collected: string[] = [];

      for await (const chunk of result) {
        collected.push(chunk);
      }

      expect(collected).toEqual(chunks);
    });
  });

  describe('remove', () => {
    it('calls DELETE with correct endpoint', async () => {
      mockClient.delete.mockResolvedValueOnce({ success: true });

      await imagesApi.remove(environmentId, imageId);

      expect(mockClient.delete).toHaveBeenCalledTimes(1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images/${imageId}`
      );
    });

    it('handles force removal', async () => {
      mockClient.delete.mockResolvedValueOnce({ success: true });

      await imagesApi.remove(environmentId, imageId);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images/${imageId}`
      );
    });
  });

  describe('prune', () => {
    it('calls POST to /prune', async () => {
      const mockPruneReport: ImagePruneReport = {
        deleted: ['sha256:old1', 'sha256:old2'],
        spaceReclaimed: 500000000,
      };

      mockClient.post.mockResolvedValueOnce({
        success: true,
        data: mockPruneReport,
      });

      const result = await imagesApi.prune(environmentId);

      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images/prune`
      );
      expect(result).toEqual(mockPruneReport);
    });

    it('returns empty prune report when no images to prune', async () => {
      const mockPruneReport: ImagePruneReport = {
        deleted: [],
        spaceReclaimed: 0,
      };

      mockClient.post.mockResolvedValueOnce({
        success: true,
        data: mockPruneReport,
      });

      const result = await imagesApi.prune(environmentId);

      expect(result).toEqual(mockPruneReport);
    });
  });

  describe('getCounts', () => {
    it('calls /counts endpoint', async () => {
      const mockCounts = { total: 15, unused: 3 };

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockCounts,
      });

      const result = await imagesApi.getCounts(environmentId);

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/environments/${environmentId}/images/counts`
      );
      expect(result).toEqual(mockCounts);
    });

    it('returns zeros when no images', async () => {
      const mockCounts = { total: 0, unused: 0 };

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockCounts,
      });

      const result = await imagesApi.getCounts(environmentId);

      expect(result).toEqual({ total: 0, unused: 0 });
    });

    it('handles environment with all unused images', async () => {
      const mockCounts = { total: 5, unused: 5 };

      mockClient.get.mockResolvedValueOnce({
        success: true,
        data: mockCounts,
      });

      const result = await imagesApi.getCounts(environmentId);

      expect(result.total).toBe(result.unused);
    });
  });
});
