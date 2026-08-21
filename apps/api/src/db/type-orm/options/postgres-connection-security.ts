import { isHardenedRuntime } from '../../../common/environment/runtime-environment';

type DatabaseEnvironment = Readonly<{
  NODE_ENV?: string;
  DATABASE_SSL?: string;
  DATABASE_SSL_REJECT_UNAUTHORIZED?: string;
  DATABASE_CA_CERT?: string;
}>;

export type PostgresSslOptions =
  | false
  | {
      readonly rejectUnauthorized: boolean;
      readonly ca?: string;
    };

export function createPostgresSslOptions(
  databaseUrl: string,
  environment: DatabaseEnvironment = process.env,
): PostgresSslOptions {
  const databaseHost = new URL(databaseUrl).hostname;
  const localDatabase = ['localhost', '127.0.0.1', '::1'].includes(databaseHost);
  const useSsl =
    isHardenedRuntime(environment) ||
    environment.DATABASE_SSL === 'true' ||
    (environment.DATABASE_SSL !== 'false' && !localDatabase);

  if (!useSsl) {
    return false;
  }

  const ca = environment.DATABASE_CA_CERT?.replace(/\\n/g, '\n');
  return {
    rejectUnauthorized: environment.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
    ...(ca ? { ca } : {}),
  };
}
