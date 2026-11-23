interface AppConfig {
  readonly apiBaseUrl: string;
}

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api';

export const APP_CONFIG: AppConfig = {
  apiBaseUrl: rawBaseUrl,
} as const;
