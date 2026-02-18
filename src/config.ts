export interface ArcaneConfig {
  apiUrl: string;
  apiKey: string | undefined;
  username: string | undefined;
  password: string | undefined;
}

export const config: ArcaneConfig = {
  apiUrl: process.env.ARCANE_API_URL || '',
  apiKey: process.env.ARCANE_API_KEY,
  username: process.env.ARCANE_USERNAME,
  password: process.env.ARCANE_PASSWORD,
};

export function validateConfig(): void {
  if (!config.apiUrl) {
    console.error('ARCANE_API_URL is required but not set');
  }

  const hasApiKey = !!config.apiKey;
  const hasCredentials = !!(config.username && config.password);

  if (!hasApiKey && !hasCredentials) {
    console.error('Either ARCANE_API_KEY or both ARCANE_USERNAME and ARCANE_PASSWORD must be set');
  }

  if (!hasApiKey && config.username && !config.password) {
    console.error('ARCANE_PASSWORD is required when ARCANE_USERNAME is set');
  }

  if (!hasApiKey && config.password && !config.username) {
    console.error('ARCANE_USERNAME is required when ARCANE_PASSWORD is set');
  }

  if (!config.apiUrl || (!hasApiKey && !hasCredentials)) {
    process.exit(1);
  }
}
