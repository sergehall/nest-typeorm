import { getApiUrl } from '@/config/site';

export type ApiHealth =
  | {
      readonly status: 'online';
      readonly url: string;
      readonly message: string;
      readonly checkedAt: string;
      readonly responseTimeMs: number;
      readonly databaseStatus: 'up';
    }
  | {
      readonly status: 'offline';
      readonly url: string;
      readonly message: string;
      readonly checkedAt: string;
    };

export async function getApiHealth(): Promise<ApiHealth> {
  const url = `${getApiUrl()}/health`;
  const checkedAt = new Date().toISOString();
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2_500),
      headers: { Accept: 'application/json' },
    });

    const body = (await response.json()) as {
      readonly checks?: {
        readonly database?: { readonly message?: string };
      };
    };

    if (!response.ok) {
      return {
        status: 'offline',
        url,
        checkedAt,
        message:
          body.checks?.database?.message ?? `The API responded with HTTP ${response.status}.`,
      };
    }

    return {
      status: 'online',
      url,
      checkedAt,
      message: 'NestJS and PostgreSQL are operational.',
      responseTimeMs: Math.round(performance.now() - startedAt),
      databaseStatus: 'up',
    };
  } catch {
    return {
      status: 'offline',
      url,
      checkedAt,
      message: 'The API is unavailable. Start the backend with yarn dev:api.',
    };
  }
}
