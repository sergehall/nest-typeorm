import * as argon2 from 'argon2';
import {
  resolveSwaggerAccessConfig,
  SwaggerAccessConfig,
  SwaggerAccessService,
  SwaggerLoginAttemptLimiter,
} from './swagger-access.service';

describe('SwaggerAccessService', () => {
  let config: SwaggerAccessConfig;

  beforeAll(async () => {
    const [viewerPasswordHash, adminPasswordHash] = await Promise.all([
      argon2.hash('viewer-password', { type: argon2.argon2id }),
      argon2.hash('admin-password', { type: argon2.argon2id }),
    ]);

    config = {
      viewerUsername: 'viewer',
      viewerPasswordHash,
      adminUsername: 'admin',
      adminPasswordHash,
      sessionSecret: 'test-session-secret-with-more-than-forty-three-characters',
      sessionTtlSeconds: 1_200,
    };
  });

  it('authenticates Viewer and Admin without accepting mixed credentials', async () => {
    const service = new SwaggerAccessService(config, { NODE_ENV: 'test' });

    await expect(service.authenticate('viewer', 'viewer-password')).resolves.toBe('viewer');
    await expect(service.authenticate('admin', 'admin-password')).resolves.toBe('admin');
    await expect(service.authenticate('admin', 'viewer-password')).resolves.toBeUndefined();
    await expect(service.authenticate('unknown', 'admin-password')).resolves.toBeUndefined();
  });

  it('enforces role hierarchy, expiration, and signature integrity', () => {
    const service = new SwaggerAccessService(config, { NODE_ENV: 'test' });
    const issuedAt = Date.UTC(2026, 7, 20, 21, 0, 0);
    const viewerSession = service.createSession('viewer', issuedAt);
    const adminSession = service.createSession('admin', issuedAt);

    expect(service.readSession(viewerSession, 'viewer', issuedAt + 1_000)).toBe('viewer');
    expect(service.readSession(viewerSession, 'admin', issuedAt + 1_000)).toBeUndefined();
    expect(service.readSession(adminSession, 'viewer', issuedAt + 1_000)).toBe('admin');
    expect(service.readSession(adminSession, 'admin', issuedAt + 1_000)).toBe('admin');
    expect(
      service.readSession(`${adminSession}tampered`, 'admin', issuedAt + 1_000),
    ).toBeUndefined();
    expect(service.readSession(adminSession, 'admin', issuedAt + 1_201_000)).toBeUndefined();
  });

  it('fails closed for incomplete or weak configuration', () => {
    expect(resolveSwaggerAccessConfig({ NODE_ENV: 'production' })).toBeUndefined();
    expect(
      resolveSwaggerAccessConfig({
        SWAGGER_VIEWER_USERNAME: 'viewer',
        SWAGGER_VIEWER_PASSWORD_HASH: config.viewerPasswordHash,
        SWAGGER_ADMIN_USERNAME: 'admin',
        SWAGGER_ADMIN_PASSWORD_HASH: config.adminPasswordHash,
        SWAGGER_SESSION_SECRET: 'too-short',
      }),
    ).toBeUndefined();
  });

  it('limits repeated login failures within the configured window', () => {
    const limiter = new SwaggerLoginAttemptLimiter(2, 60_000);

    expect(limiter.getRetryAfterSeconds('client', 1_000)).toBeUndefined();
    limiter.recordFailure('client', 1_000);
    limiter.recordFailure('client', 2_000);
    expect(limiter.getRetryAfterSeconds('client', 2_000)).toBe(59);
    expect(limiter.getRetryAfterSeconds('client', 62_000)).toBeUndefined();
  });
});
