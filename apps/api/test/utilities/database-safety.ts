const POSTGRES_PROTOCOLS = new Set(['postgres:', 'postgresql:']);
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const TEST_DATABASE_NAME_PATTERN = /(?:^|[_-])(test|e2e)(?:[_-]|$)/i;

type Environment = Readonly<Record<string, string | undefined>>;

export interface SafeTestDatabase {
  readonly databaseName: string;
  readonly isLoopback: boolean;
  readonly url: string;
}

export const getSafeTestDatabase = (environment: Environment): SafeTestDatabase => {
  if (environment.NODE_ENV !== 'test') {
    throw new Error('E2E database reset is allowed only when NODE_ENV=test.');
  }

  const databaseUrl = environment.E2E_DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      'E2E_DATABASE_URL is required. Point it to a dedicated PostgreSQL test database.',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('E2E_DATABASE_URL must be a valid PostgreSQL URL.');
  }

  if (!POSTGRES_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error('E2E_DATABASE_URL must use the postgres or postgresql protocol.');
  }

  const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));
  if (!TEST_DATABASE_NAME_PATTERN.test(databaseName)) {
    throw new Error('The E2E database name must contain a distinct test or e2e segment.');
  }

  const isLoopbackDatabase = LOOPBACK_HOSTS.has(parsedUrl.hostname);
  const isRemoteResetExplicitlyAllowed = environment.E2E_ALLOW_REMOTE_DATABASE_RESET === 'true';

  if (!isLoopbackDatabase && !isRemoteResetExplicitlyAllowed) {
    throw new Error(
      'Remote E2E database reset is blocked. Use a loopback database or explicitly opt in.',
    );
  }

  return { databaseName, isLoopback: isLoopbackDatabase, url: databaseUrl };
};
