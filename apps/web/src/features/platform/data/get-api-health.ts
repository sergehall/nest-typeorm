import { getApiUrl } from '@/config/site';

export type ApiHealth =
  | {
      readonly status: 'online';
      readonly url: string;
      readonly message: string;
      readonly checkedAt: string;
      readonly responseTimeMs: number;
    }
  | {
      readonly status: 'offline';
      readonly url: string;
      readonly message: string;
      readonly checkedAt: string;
    };

export async function getApiHealth(): Promise<ApiHealth> {
  const url = getApiUrl();
  const checkedAt = new Date().toISOString();
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2_500),
      headers: { Accept: 'text/plain, application/json' },
    });

    if (!response.ok) {
      return {
        status: 'offline',
        url,
        checkedAt,
        message: `API ответил с HTTP ${response.status}.`,
      };
    }

    const message = (await response.text()).trim();

    return {
      status: 'online',
      url,
      checkedAt,
      message: message || 'API отвечает.',
      responseTimeMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return {
      status: 'offline',
      url,
      checkedAt,
      message: 'API недоступен. Запустите backend командой yarn dev:api.',
    };
  }
}
