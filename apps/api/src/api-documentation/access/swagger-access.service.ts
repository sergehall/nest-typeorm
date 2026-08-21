import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import * as argon2 from 'argon2';
import { CookieOptions, Request, Response } from 'express';
import { isHardenedRuntime } from '../../common/environment/runtime-environment';

export type SwaggerAccessRole = 'viewer' | 'admin';

export type SwaggerAccessConfig = Readonly<{
  viewerUsername: string;
  viewerPasswordHash: string;
  adminUsername: string;
  adminPasswordHash: string;
  sessionSecret: string;
  sessionTtlSeconds: number;
}>;

type SwaggerSessionPayload = Readonly<{
  version: 1;
  role: SwaggerAccessRole;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}>;

const DEFAULT_SESSION_TTL_SECONDS = 20 * 60;
const MINIMUM_SESSION_SECRET_LENGTH = 43;
const MAXIMUM_SESSION_TOKEN_LENGTH = 2_048;
const ARGON2ID_PREFIX = '$argon2id$';

function readRequiredEnvironmentValue(
  environment: NodeJS.ProcessEnv,
  name: string,
): string | undefined {
  const value = environment[name]?.trim();
  return value ? value : undefined;
}

export function resolveSwaggerAccessConfig(
  environment: NodeJS.ProcessEnv = process.env,
): SwaggerAccessConfig | undefined {
  const viewerUsername = readRequiredEnvironmentValue(environment, 'SWAGGER_VIEWER_USERNAME');
  const viewerPasswordHash = readRequiredEnvironmentValue(
    environment,
    'SWAGGER_VIEWER_PASSWORD_HASH',
  );
  const adminUsername = readRequiredEnvironmentValue(environment, 'SWAGGER_ADMIN_USERNAME');
  const adminPasswordHash = readRequiredEnvironmentValue(
    environment,
    'SWAGGER_ADMIN_PASSWORD_HASH',
  );
  const sessionSecret = readRequiredEnvironmentValue(environment, 'SWAGGER_SESSION_SECRET');
  const configuredTtl = Number(environment.SWAGGER_SESSION_TTL_SECONDS);
  const sessionTtlSeconds = Number.isInteger(configuredTtl)
    ? configuredTtl
    : DEFAULT_SESSION_TTL_SECONDS;

  if (
    !viewerUsername ||
    !viewerPasswordHash?.startsWith(ARGON2ID_PREFIX) ||
    !adminUsername ||
    !adminPasswordHash?.startsWith(ARGON2ID_PREFIX) ||
    !sessionSecret ||
    sessionSecret.length < MINIMUM_SESSION_SECRET_LENGTH ||
    viewerUsername === adminUsername ||
    sessionTtlSeconds < 300 ||
    sessionTtlSeconds > 3_600
  ) {
    return undefined;
  }

  return {
    viewerUsername,
    viewerPasswordHash,
    adminUsername,
    adminPasswordHash,
    sessionSecret,
    sessionTtlSeconds,
  };
}

function safeEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function parseSessionPayload(encodedPayload: string): SwaggerSessionPayload | undefined {
  try {
    const value: unknown = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));

    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const payload = value as Partial<SwaggerSessionPayload>;
    if (
      payload.version !== 1 ||
      (payload.role !== 'viewer' && payload.role !== 'admin') ||
      !Number.isInteger(payload.issuedAt) ||
      !Number.isInteger(payload.expiresAt) ||
      typeof payload.nonce !== 'string' ||
      payload.nonce.length < 16
    ) {
      return undefined;
    }

    return payload as SwaggerSessionPayload;
  } catch {
    return undefined;
  }
}

export class SwaggerAccessService {
  readonly sessionCookieName: string;
  readonly csrfCookieName: string;

  constructor(
    private readonly config: SwaggerAccessConfig,
    private readonly environment: NodeJS.ProcessEnv = process.env,
  ) {
    const hardened = isHardenedRuntime(environment);
    this.sessionCookieName = hardened ? '__Host-nestlab-docs-session' : 'nestlab_docs_session';
    this.csrfCookieName = hardened ? '__Host-nestlab-docs-csrf' : 'nestlab_docs_csrf';
  }

  async authenticate(username: string, password: string): Promise<SwaggerAccessRole | undefined> {
    if (username.length > 64 || password.length < 1 || password.length > 256) {
      return undefined;
    }

    const [viewerPasswordMatches, adminPasswordMatches] = await Promise.all([
      argon2.verify(this.config.viewerPasswordHash, password).catch(() => false),
      argon2.verify(this.config.adminPasswordHash, password).catch(() => false),
    ]);

    if (safeEqual(username, this.config.adminUsername) && adminPasswordMatches) {
      return 'admin';
    }

    if (safeEqual(username, this.config.viewerUsername) && viewerPasswordMatches) {
      return 'viewer';
    }

    return undefined;
  }

  createSession(role: SwaggerAccessRole, now = Date.now()): string {
    const issuedAt = Math.floor(now / 1_000);
    const payload: SwaggerSessionPayload = {
      version: 1,
      role,
      issuedAt,
      expiresAt: issuedAt + this.config.sessionTtlSeconds,
      nonce: randomBytes(18).toString('base64url'),
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.sign(encodedPayload);

    return `${encodedPayload}.${signature}`;
  }

  readSession(
    token: unknown,
    requiredRole: SwaggerAccessRole,
    now = Date.now(),
  ): SwaggerAccessRole | undefined {
    if (typeof token !== 'string' || token.length > MAXIMUM_SESSION_TOKEN_LENGTH) {
      return undefined;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return undefined;
    }

    const [encodedPayload, actualSignature] = parts;
    if (
      !encodedPayload ||
      !actualSignature ||
      !safeEqual(actualSignature, this.sign(encodedPayload))
    ) {
      return undefined;
    }

    const payload = parseSessionPayload(encodedPayload);
    const nowSeconds = Math.floor(now / 1_000);
    if (
      !payload ||
      payload.issuedAt > nowSeconds + 30 ||
      payload.expiresAt <= nowSeconds ||
      payload.expiresAt - payload.issuedAt > this.config.sessionTtlSeconds
    ) {
      return undefined;
    }

    if (requiredRole === 'admin' && payload.role !== 'admin') {
      return undefined;
    }

    return payload.role;
  }

  readRequestSession(
    request: Request,
    requiredRole: SwaggerAccessRole,
  ): SwaggerAccessRole | undefined {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    return this.readSession(cookies?.[this.sessionCookieName], requiredRole);
  }

  createCsrfToken(): string {
    return randomBytes(32).toString('base64url');
  }

  verifyCsrfToken(request: Request, submittedToken: unknown): boolean {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const cookieToken = cookies?.[this.csrfCookieName];

    return (
      typeof cookieToken === 'string' &&
      typeof submittedToken === 'string' &&
      cookieToken.length <= 128 &&
      submittedToken.length <= 128 &&
      safeEqual(cookieToken, submittedToken)
    );
  }

  setSessionCookie(response: Response, token: string): void {
    response.cookie(this.sessionCookieName, token, {
      ...this.baseCookieOptions(),
      maxAge: this.config.sessionTtlSeconds * 1_000,
    });
  }

  setCsrfCookie(response: Response, token: string): void {
    response.cookie(this.csrfCookieName, token, {
      ...this.baseCookieOptions(),
      maxAge: 10 * 60 * 1_000,
    });
  }

  clearCookies(response: Response): void {
    const options = this.baseCookieOptions();
    response.clearCookie(this.sessionCookieName, options);
    response.clearCookie(this.csrfCookieName, options);
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.config.sessionSecret).update(payload).digest('base64url');
  }

  private baseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: isHardenedRuntime(this.environment),
      sameSite: 'strict',
      path: '/',
    };
  }
}

type AttemptRecord = { count: number; resetAt: number };

export class SwaggerLoginAttemptLimiter {
  private readonly attempts = new Map<string, AttemptRecord>();

  constructor(
    private readonly limit = 5,
    private readonly windowMs = 15 * 60 * 1_000,
  ) {}

  getRetryAfterSeconds(key: string, now = Date.now()): number | undefined {
    this.removeExpired(now);
    const record = this.attempts.get(key);

    if (!record || record.count < this.limit) {
      return undefined;
    }

    return Math.max(1, Math.ceil((record.resetAt - now) / 1_000));
  }

  recordFailure(key: string, now = Date.now()): void {
    this.removeExpired(now);
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }

    record.count += 1;
  }

  clear(key: string): void {
    this.attempts.delete(key);
  }

  private removeExpired(now: number): void {
    if (this.attempts.size > 10_000) {
      this.attempts.clear();
      return;
    }

    for (const [key, record] of this.attempts) {
      if (record.resetAt <= now) {
        this.attempts.delete(key);
      }
    }
  }
}
