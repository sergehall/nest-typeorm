const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_ERROR_BODY_LENGTH = 1_000;

export type JsonValidator<T> = (value: unknown) => value is T;

export type ExternalJsonRequestOptions<T> = {
  readonly provider: string;
  readonly url: string | URL;
  readonly init?: Omit<RequestInit, 'signal'>;
  readonly validate: JsonValidator<T>;
  readonly timeoutMs?: number;
};

type ExternalHttpErrorOptions = ErrorOptions & {
  readonly status?: number;
  readonly responseBody?: string;
};

export class ExternalHttpError extends Error {
  readonly status?: number;
  readonly responseBody?: string;

  constructor(message: string, options: ExternalHttpErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'ExternalHttpError';
    this.status = options.status;
    this.responseBody = options.responseBody;
  }
}

export async function requestExternalJson<T>(options: ExternalJsonRequestOptions<T>): Promise<T> {
  const { provider, url, init, validate, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error: unknown) {
    throw new ExternalHttpError(`${provider} request failed`, { cause: error });
  }

  if (!response.ok) {
    let responseBody: string;

    try {
      responseBody = (await response.text()).slice(0, MAX_ERROR_BODY_LENGTH);
    } catch (error: unknown) {
      throw new ExternalHttpError(
        `${provider} request failed with HTTP ${response.status}; response body could not be read`,
        { cause: error, status: response.status },
      );
    }

    const httpError = new Error(
      `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`,
    );
    throw new ExternalHttpError(`${provider} request failed with HTTP ${response.status}`, {
      cause: httpError,
      status: response.status,
      responseBody,
    });
  }

  let payload: unknown;

  try {
    payload = (await response.json()) as unknown;
  } catch (error: unknown) {
    throw new ExternalHttpError(`${provider} returned invalid JSON`, {
      cause: error,
      status: response.status,
    });
  }

  if (!validate(payload)) {
    throw new ExternalHttpError(`${provider} returned an invalid response payload`, {
      cause: new TypeError('External JSON response did not match the expected schema'),
      status: response.status,
    });
  }

  return payload;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
