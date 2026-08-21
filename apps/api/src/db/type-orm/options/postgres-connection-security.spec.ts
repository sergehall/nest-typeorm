import { createPostgresSslOptions } from './postgres-connection-security';

describe('createPostgresSslOptions', () => {
  it('allows plaintext only for an explicitly local development database', () => {
    expect(
      createPostgresSslOptions('postgresql://user:pass@localhost:5432/nestlab', {
        NODE_ENV: 'development',
        DATABASE_SSL: 'false',
      }),
    ).toBe(false);
  });

  it('enables certificate verification for remote and hardened runtimes', () => {
    expect(
      createPostgresSslOptions('postgresql://user:pass@database.example.com:5432/nestlab', {
        NODE_ENV: 'production',
      }),
    ).toEqual({ rejectUnauthorized: true });
  });

  it('accepts a provider CA without weakening certificate verification', () => {
    expect(
      createPostgresSslOptions('postgresql://user:pass@database.example.com:5432/nestlab', {
        NODE_ENV: 'production',
        DATABASE_CA_CERT: 'line-one\\nline-two',
      }),
    ).toEqual({ rejectUnauthorized: true, ca: 'line-one\nline-two' });
  });
});
