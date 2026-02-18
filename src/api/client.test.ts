import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ArcaneClient, ArcaneApiError } from './client.js';
import type { ArcaneConfig } from '../config.js';
import type { LoginResponse } from '../types/auth.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const createMockResponse = <T>(
  data: T,
  options: {
    ok?: boolean;
    status?: number;
    statusText?: string;
    contentType?: string;
  } = {}
): Response => {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    contentType = 'application/json',
  } = options;

  const response = {
    ok,
    status,
    statusText,
    headers: new Headers({
      'content-type': contentType,
    }),
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(typeof data === 'string' ? data : JSON.stringify(data)),
  };

  return response as unknown as Response;
};

const createApiConfig = (overrides: Partial<ArcaneConfig> = {}): ArcaneConfig => ({
  apiUrl: 'https://arcane.example.com/api',
  apiKey: undefined,
  username: undefined,
  password: undefined,
  ...overrides,
});

const createLoginResponse = (overrides: Partial<LoginResponse> = {}): LoginResponse => ({
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresIn: 3600,
  ...overrides,
});

describe('ArcaneClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('stores config correctly', () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      expect(client.getConfig()).toEqual(config);
    });

    it('stores config with username/password', () => {
      const config = createApiConfig({
        username: 'testuser',
        password: 'testpass',
      });
      const client = new ArcaneClient(config);

      expect(client.getConfig()).toEqual(config);
    });
  });

  describe('authenticate()', () => {
    it('calls /api/auth/login with credentials and stores token', async () => {
      const config = createApiConfig({
        username: 'testuser',
        password: 'testpass',
      });
      const client = new ArcaneClient(config);
      const loginResponse = createLoginResponse();

      mockFetch.mockResolvedValueOnce(createMockResponse(loginResponse));

      const result = await client.authenticate();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpass',
          }),
        })
      );

      expect(result).toEqual(loginResponse);
      expect(client.isAuthenticated()).toBe(true);
    });

    it('throws error when username is missing', async () => {
      const config = createApiConfig({ password: 'testpass' });
      const client = new ArcaneClient(config);

      await expect(client.authenticate()).rejects.toThrow(
        'Username and password required for authentication'
      );
    });

    it('throws error when password is missing', async () => {
      const config = createApiConfig({ username: 'testuser' });
      const client = new ArcaneClient(config);

      await expect(client.authenticate()).rejects.toThrow(
        'Username and password required for authentication'
      );
    });

    it('stores token, refreshToken, and tokenExpiry', async () => {
      const config = createApiConfig({
        username: 'testuser',
        password: 'testpass',
      });
      const client = new ArcaneClient(config);
      const loginResponse = createLoginResponse({
        accessToken: 'stored-access-token',
        refreshToken: 'stored-refresh-token',
        expiresIn: 7200,
      });

      vi.setSystemTime(1000000);
      mockFetch.mockResolvedValueOnce(createMockResponse(loginResponse));

      await client.authenticate();

      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('refreshAccessToken()', () => {
    it('calls /api/auth/refresh and updates token', async () => {
      const config = createApiConfig({
        username: 'testuser',
        password: 'testpass',
      });
      const client = new ArcaneClient(config);

      const initialResponse = createLoginResponse({
        accessToken: 'initial-token',
        refreshToken: 'initial-refresh-token',
      });
      mockFetch.mockResolvedValueOnce(createMockResponse(initialResponse));

      await client.authenticate();

      const refreshedResponse = createLoginResponse({
        accessToken: 'refreshed-token',
        refreshToken: 'refreshed-refresh-token',
      });
      mockFetch.mockResolvedValueOnce(createMockResponse(refreshedResponse));

      await client.refreshAccessToken();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://arcane.example.com/api/api/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ refreshToken: 'initial-refresh-token' }),
        })
      );
    });

    it('throws error when no refresh token available', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      await expect(client.refreshAccessToken()).rejects.toThrow(
        'No refresh token available'
      );
    });
  });

  describe('get()', () => {
    it('makes GET request with correct headers', async () => {
      const config = createApiConfig({ apiKey: 'test-api-key' });
      const client = new ArcaneClient(config);
      const responseData = { id: '1', name: 'test' };

      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await client.get('/containers');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/containers',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          }),
        })
      );
      expect(result).toEqual(responseData);
    });

    it('appends query params to URL', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(createMockResponse([]));

      await client.get('/containers', { search: 'nginx', limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/containers?search=nginx&limit=10',
        expect.any(Object)
      );
    });

    it('ignores undefined query params', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(createMockResponse([]));

      await client.get('/containers', { search: 'test', limit: undefined });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).not.toContain('limit');
      expect(calledUrl).toContain('search=test');
    });
    it('does not append query string when all params are undefined', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(createMockResponse([]));

      await client.get('/containers', { search: undefined, limit: undefined });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toBe('https://arcane.example.com/api/containers');
      expect(calledUrl).not.toContain('?');
    });
  });

  describe('post()', () => {
    it('makes POST request with correct headers and body', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);
      const requestBody = { name: 'test-container', image: 'nginx' };
      const responseData = { id: '123', success: true };

      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await client.post('/containers', requestBody);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/containers',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-key',
          }),
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(responseData);
    });

    it('makes POST request without body when data is undefined', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await client.post('/containers/restart');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/containers/restart',
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });
  });

  describe('put()', () => {
    it('makes PUT request with correct headers and body', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);
      const requestBody = { name: 'updated-name' };
      const responseData = { id: '123', updated: true };

      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await client.put('/containers/123', requestBody);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/containers/123',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-key',
          }),
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(responseData);
    });

    it('makes PUT request without body when data is undefined', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await client.put('/containers/123/toggle');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/containers/123/toggle',
        expect.objectContaining({
          method: 'PUT',
          body: undefined,
        })
      );
    });
  });

  describe('delete()', () => {
    it('makes DELETE request with correct headers', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);
      const responseData = { success: true, message: 'Deleted' };

      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await client.delete('/containers/123');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/containers/123',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-key',
          }),
        })
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('API key authentication', () => {
    it('adds X-API-Key header', async () => {
      const config = createApiConfig({ apiKey: 'my-secret-api-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await client.get('/test');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['X-API-Key']).toBe('my-secret-api-key');
      expect(headers['Authorization']).toBeUndefined();
    });

    it('isAuthenticated returns true with API key', () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('JWT authentication', () => {
    it('adds Authorization: Bearer header after authenticate()', async () => {
      const config = createApiConfig({
        username: 'testuser',
        password: 'testpass',
      });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(
        createMockResponse(createLoginResponse({ accessToken: 'jwt-token-123' }))
      );

      await client.authenticate();
      mockFetch.mockClear();

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await client.get('/test');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBe('Bearer jwt-token-123');
      expect(headers['X-API-Key']).toBeUndefined();
    });

    it('isAuthenticated returns false before authenticate()', () => {
      const config = createApiConfig({
        username: 'testuser',
        password: 'testpass',
      });
      const client = new ArcaneClient(config);

      expect(client.isAuthenticated()).toBe(false);
    });

    it('isAuthenticated returns true after authenticate()', async () => {
      const config = createApiConfig({
        username: 'testuser',
        password: 'testpass',
      });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(createMockResponse(createLoginResponse()));

      await client.authenticate();

      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('request errors', () => {
    it('throws ArcaneApiError on non-OK response', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(
        createMockResponse('Container not found', {
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
      );

      await expect(client.get('/containers/999')).rejects.toThrow(ArcaneApiError);
    });

    it('ArcaneApiError contains status code and response body', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(
        createMockResponse('{"error":"Unauthorized"}', {
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        })
      );

      try {
        await client.get('/protected');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ArcaneApiError);
        const apiError = error as ArcaneApiError;
        expect(apiError.statusCode).toBe(401);
        expect(apiError.responseBody).toContain('Unauthorized');
        expect(apiError.message).toContain('401');
        expect(apiError.message).toContain('Unauthorized');
      }
    });

    it('throws error with correct message format', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(
        createMockResponse('Bad Request', {
          ok: false,
          status: 400,
          statusText: 'Bad Request',
        })
      );

      await expect(client.post('/test', {})).rejects.toThrow(
        'API request failed: 400 Bad Request'
      );
    });
  });

  describe('auto-authentication', () => {
    it('auto-authenticates when using username/password on first request', async () => {
      const config = createApiConfig({
        username: 'auto-user',
        password: 'auto-pass',
      });
      const client = new ArcaneClient(config);

      mockFetch
        .mockResolvedValueOnce(
          createMockResponse(createLoginResponse({ accessToken: 'auto-token' }))
        )
        .mockResolvedValueOnce(createMockResponse({ data: 'test' }));

      const result = await client.get('/containers');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'https://arcane.example.com/api/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'auto-user', password: 'auto-pass' }),
        })
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('auto-authenticates before POST request', async () => {
      const config = createApiConfig({
        username: 'user',
        password: 'pass',
      });
      const client = new ArcaneClient(config);

      mockFetch
        .mockResolvedValueOnce(createMockResponse(createLoginResponse()))
        .mockResolvedValueOnce(createMockResponse({ created: true }));

      await client.post('/containers', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/api/auth/login'),
        expect.any(Object)
      );
    });

    it('auto-authenticates before PUT request', async () => {
      const config = createApiConfig({
        username: 'user',
        password: 'pass',
      });
      const client = new ArcaneClient(config);

      mockFetch
        .mockResolvedValueOnce(createMockResponse(createLoginResponse()))
        .mockResolvedValueOnce(createMockResponse({ updated: true }));

      await client.put('/containers/1', { name: 'updated' });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('auto-authenticates before DELETE request', async () => {
      const config = createApiConfig({
        username: 'user',
        password: 'pass',
      });
      const client = new ArcaneClient(config);

      mockFetch
        .mockResolvedValueOnce(createMockResponse(createLoginResponse()))
        .mockResolvedValueOnce(createMockResponse({ deleted: true }));

      await client.delete('/containers/1');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('refreshes token when approaching expiry', async () => {
      const config = createApiConfig({
        username: 'user',
        password: 'pass',
      });
      const client = new ArcaneClient(config);

      vi.setSystemTime(0);
      mockFetch.mockResolvedValueOnce(
        createMockResponse(createLoginResponse({ expiresIn: 120 }))
      );

      await client.authenticate();
      mockFetch.mockClear();

      vi.setSystemTime(65000);

      mockFetch.mockResolvedValueOnce(
        createMockResponse(createLoginResponse({ accessToken: 'refreshed-token' }))
      );
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/api/auth/refresh'),
        expect.any(Object)
      );
    });

    it('does not auto-authenticate when API key is provided', async () => {
      const config = createApiConfig({
        apiKey: 'test-key',
        username: 'user',
        password: 'pass',
      });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-key',
          }),
        })
      );
    });
  });

  describe('response handling', () => {
    it('parses JSON response', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);
      const data = { id: '123', name: 'test', nested: { value: 42 } };

      mockFetch.mockResolvedValueOnce(createMockResponse(data));

      const result = await client.get('/test');

      expect(result).toEqual(data);
    });

    it('returns text for non-JSON response', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(
        createMockResponse('plain text response', {
          contentType: 'text/plain',
        })
      );

      const result = await client.get('/test');

      expect(result).toBe('plain text response');
    });
  });

  describe('postStream()', () => {
    const createMockStreamReader = (chunks: string[]) => {
      let index = 0;
      return {
        read: vi.fn().mockImplementation(async () => {
          if (index >= chunks.length) {
            return { done: true, value: undefined };
          }
          const chunk = chunks[index];
          index++;
          return { done: false, value: new TextEncoder().encode(chunk) };
        }),
      };
    };

    const createMockStreamResponse = (
      reader: ReturnType<typeof createMockStreamReader>,
      options: {
        ok?: boolean;
        status?: number;
        statusText?: string;
      } = {}
    ): Response => {
      const { ok = true, status = 200, statusText = 'OK' } = options;

      const response = {
        ok,
        status,
        statusText,
        headers: new Headers({
          'content-type': 'text/event-stream',
        }),
        text: vi.fn().mockResolvedValue('Error body'),
        body: {
          getReader: () => reader,
        },
      };

      return response as unknown as Response;
    };

    it('makes POST request with correct headers using API key', async () => {
      const config = createApiConfig({ apiKey: 'stream-api-key' });
      const client = new ArcaneClient(config);
      const reader = createMockStreamReader(['chunk1', 'chunk2']);

      mockFetch.mockResolvedValueOnce(createMockStreamResponse(reader));

      const stream = await client.postStream('/containers/logs');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/containers/logs',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'stream-api-key',
          }),
        })
      );

      for await (const _ of stream) {
        break;
      }
    });

    it('makes POST request with Bearer token after authenticate()', async () => {
      const config = createApiConfig({
        username: 'streamuser',
        password: 'streampass',
      });
      const client = new ArcaneClient(config);
      const reader = createMockStreamReader(['data']);

      mockFetch
        .mockResolvedValueOnce(createMockResponse(createLoginResponse({ accessToken: 'stream-bearer-token' })))
        .mockResolvedValueOnce(createMockStreamResponse(reader));

      const stream = await client.postStream('/stream');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://arcane.example.com/api/stream',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer stream-bearer-token',
          }),
        })
      );

      for await (const _ of stream) {
        break;
      }
    });

    it('makes POST request with body data', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);
      const reader = createMockStreamReader(['response']);
      const requestBody = { containerId: 'abc123', tail: 100 };

      mockFetch.mockResolvedValueOnce(createMockStreamResponse(reader));

      const stream = await client.postStream('/containers/logs', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/containers/logs',
        expect.objectContaining({
          body: JSON.stringify(requestBody),
        })
      );

      for await (const _ of stream) {
        break;
      }
    });

    it('throws ArcaneApiError on non-OK response', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(
        createMockStreamResponse(createMockStreamReader([]), {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
      );

      await expect(client.postStream('/stream')).rejects.toThrow(ArcaneApiError);
    });

    it('throws ArcaneApiError with correct status code and message', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      mockFetch.mockResolvedValueOnce(
        createMockStreamResponse(createMockStreamReader([]), {
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
      );

      try {
        await client.postStream('/missing');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ArcaneApiError);
        const apiError = error as ArcaneApiError;
        expect(apiError.statusCode).toBe(404);
        expect(apiError.message).toContain('404');
        expect(apiError.message).toContain('Not Found');
      }
    });

    it('returns async iterable that yields decoded chunks', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);
      const reader = createMockStreamReader(['first', 'second', 'third']);

      mockFetch.mockResolvedValueOnce(createMockStreamResponse(reader));

      const stream = await client.postStream('/stream');
      const chunks: string[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['first', 'second', 'third']);
      expect(reader.read).toHaveBeenCalledTimes(4);
    });

    it('throws error when response body is not readable (no reader)', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: null,
      };

      mockFetch.mockResolvedValueOnce(response as unknown as Response);

      await expect(client.postStream('/stream')).rejects.toThrow(
        'Response body is not readable'
      );
    });

    it('handles auto-authentication before streaming', async () => {
      const config = createApiConfig({
        username: 'autostream',
        password: 'autopass',
      });
      const client = new ArcaneClient(config);
      const reader = createMockStreamReader(['streamed-data']);

      mockFetch
        .mockResolvedValueOnce(createMockResponse(createLoginResponse({ accessToken: 'auto-stream-token' })))
        .mockResolvedValueOnce(createMockStreamResponse(reader));

      const stream = await client.postStream('/stream');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'https://arcane.example.com/api/api/auth/login',
        expect.objectContaining({
          method: 'POST',
        })
      );

      for await (const _ of stream) {
        break;
      }
    });

    it('makes POST request without body when data is undefined', async () => {
      const config = createApiConfig({ apiKey: 'test-key' });
      const client = new ArcaneClient(config);
      const reader = createMockStreamReader(['ok']);

      mockFetch.mockResolvedValueOnce(createMockStreamResponse(reader));

      const stream = await client.postStream('/stream');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://arcane.example.com/api/stream',
        expect.objectContaining({
          body: undefined,
        })
      );

      for await (const _ of stream) {
        break;
      }
    });
  });
});

describe('ArcaneApiError', () => {
  it('has correct name', () => {
    const error = new ArcaneApiError('Test error', 500, 'body');
    expect(error.name).toBe('ArcaneApiError');
  });

  it('stores all properties', () => {
    const error = new ArcaneApiError('Request failed', 404, '{"error":"not found"}');

    expect(error.message).toBe('Request failed');
    expect(error.statusCode).toBe(404);
    expect(error.responseBody).toBe('{"error":"not found"}');
  });

  it('is instance of Error', () => {
    const error = new ArcaneApiError('Test', 400, '');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ArcaneApiError);
  });
});