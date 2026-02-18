import type { ArcaneConfig } from '../config.js';
import type { ApiResponse, MessageResponse } from '../types/index.js';
import type { LoginResponse } from '../types/auth.js';

export class ArcaneClient {
  private config: ArcaneConfig;
  private token: string | null = null;
  private refreshTokenValue: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: ArcaneConfig) {
    this.config = config;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    } else if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ArcaneApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
        error
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  async authenticate(): Promise<LoginResponse> {
    if (!this.config.username || !this.config.password) {
      throw new Error('Username and password required for authentication');
    }

    const response = await this.fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: this.config.username,
        password: this.config.password,
      }),
    });

    this.token = response.accessToken;
    this.refreshTokenValue = response.refreshToken;
    this.tokenExpiry = Date.now() + response.expiresIn * 1000;

    return response;
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await this.fetch<LoginResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshTokenValue }),
    });

    this.token = response.accessToken;
    this.refreshTokenValue = response.refreshToken;
    this.tokenExpiry = Date.now() + response.expiresIn * 1000;
  }

  private async ensureAuthenticated(): Promise<void> {
    if (this.config.apiKey) return;

    if (!this.token && this.config.username && this.config.password) {
      await this.authenticate();
      return;
    }

    if (this.tokenExpiry && Date.now() >= this.tokenExpiry - 60000) {
      await this.refreshAccessToken();
    }
  }

  async get<T>(endpoint: string, params?: object): Promise<T> {
    await this.ensureAuthenticated();
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.fetch<T>(url);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    await this.ensureAuthenticated();
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    await this.ensureAuthenticated();
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    await this.ensureAuthenticated();
    return this.fetch<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async postStream(endpoint: string, data?: unknown): Promise<AsyncIterable<string>> {
    await this.ensureAuthenticated();
    const url = `${this.config.apiUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    } else if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ArcaneApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
        error
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();

    return {
      async *[Symbol.asyncIterator]() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield decoder.decode(value, { stream: true });
        }
      },
    };
  }

  getConfig(): ArcaneConfig {
    return this.config;
  }

  isAuthenticated(): boolean {
    return !!this.token || !!this.config.apiKey;
  }
}

export class ArcaneApiError extends Error {
  public readonly statusCode: number;
  public readonly responseBody: string;

  constructor(message: string, statusCode: number, responseBody: string) {
    super(message);
    this.name = 'ArcaneApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}