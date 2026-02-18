import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('config', () => {
  const originalEnv = process.env;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.ARCANE_API_URL;
    delete process.env.ARCANE_API_KEY;
    delete process.env.ARCANE_USERNAME;
    delete process.env.ARCANE_PASSWORD;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  describe('config object', () => {
    it('reads environment variables correctly', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');
      vi.stubEnv('ARCANE_API_KEY', 'test-api-key');
      vi.stubEnv('ARCANE_USERNAME', 'testuser');
      vi.stubEnv('ARCANE_PASSWORD', 'testpass');

      const { config } = await import('./config.js');

      expect(config.apiUrl).toBe('https://api.example.com');
      expect(config.apiKey).toBe('test-api-key');
      expect(config.username).toBe('testuser');
      expect(config.password).toBe('testpass');
    });

    it('defaults apiUrl to empty string when ARCANE_API_URL is not set', async () => {
      const { config } = await import('./config.js');

      expect(config.apiUrl).toBe('');
      expect(config.apiKey).toBeUndefined();
      expect(config.username).toBeUndefined();
      expect(config.password).toBeUndefined();
    });

    it('handles partial credentials (only username)', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');
      vi.stubEnv('ARCANE_USERNAME', 'testuser');

      const { config } = await import('./config.js');

      expect(config.username).toBe('testuser');
      expect(config.password).toBeUndefined();
    });

    it('handles partial credentials (only password)', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');
      vi.stubEnv('ARCANE_PASSWORD', 'testpass');

      const { config } = await import('./config.js');

      expect(config.username).toBeUndefined();
      expect(config.password).toBe('testpass');
    });
  });

  describe('validateConfig', () => {
    it('passes with valid API key config', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');
      vi.stubEnv('ARCANE_API_KEY', 'test-api-key');

      const { validateConfig } = await import('./config.js');

      expect(() => validateConfig()).not.toThrow();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('passes with valid username/password config', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');
      vi.stubEnv('ARCANE_USERNAME', 'testuser');
      vi.stubEnv('ARCANE_PASSWORD', 'testpass');

      const { validateConfig } = await import('./config.js');

      expect(() => validateConfig()).not.toThrow();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('exits when ARCANE_API_URL is missing', async () => {
      vi.stubEnv('ARCANE_API_KEY', 'test-api-key');

      const { validateConfig } = await import('./config.js');

      expect(() => validateConfig()).toThrow('process.exit called');
      expect(consoleErrorSpy).toHaveBeenCalledWith('ARCANE_API_URL is required but not set');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('exits when ARCANE_API_URL is empty string', async () => {
      vi.stubEnv('ARCANE_API_URL', '');
      vi.stubEnv('ARCANE_API_KEY', 'test-api-key');

      const { validateConfig } = await import('./config.js');

      expect(() => validateConfig()).toThrow('process.exit called');
      expect(consoleErrorSpy).toHaveBeenCalledWith('ARCANE_API_URL is required but not set');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('exits when neither API key nor credentials are provided', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');

      const { validateConfig } = await import('./config.js');

      expect(() => validateConfig()).toThrow('process.exit called');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Either ARCANE_API_KEY or both ARCANE_USERNAME and ARCANE_PASSWORD must be set'
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('exits when only username is provided without password', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');
      vi.stubEnv('ARCANE_USERNAME', 'testuser');

      const { validateConfig } = await import('./config.js');

      expect(() => validateConfig()).toThrow('process.exit called');
      expect(consoleErrorSpy).toHaveBeenCalledWith('ARCANE_PASSWORD is required when ARCANE_USERNAME is set');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('exits when only password is provided without username', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');
      vi.stubEnv('ARCANE_PASSWORD', 'testpass');

      const { validateConfig } = await import('./config.js');

      expect(() => validateConfig()).toThrow('process.exit called');
      expect(consoleErrorSpy).toHaveBeenCalledWith('ARCANE_USERNAME is required when ARCANE_PASSWORD is set');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('passes when API key is present even with incomplete credentials', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');
      vi.stubEnv('ARCANE_API_KEY', 'test-api-key');
      vi.stubEnv('ARCANE_USERNAME', 'testuser');

      const { validateConfig } = await import('./config.js');

      expect(() => validateConfig()).not.toThrow();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('passes when API key is present alongside complete credentials', async () => {
      vi.stubEnv('ARCANE_API_URL', 'https://api.example.com');
      vi.stubEnv('ARCANE_API_KEY', 'test-api-key');
      vi.stubEnv('ARCANE_USERNAME', 'testuser');
      vi.stubEnv('ARCANE_PASSWORD', 'testpass');

      const { validateConfig } = await import('./config.js');

      expect(() => validateConfig()).not.toThrow();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });
});
