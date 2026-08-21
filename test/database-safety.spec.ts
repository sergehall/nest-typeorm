import { getSafeTestDatabase } from './utilities/database-safety';

describe('E2E database safety', () => {
  it('accepts a dedicated loopback test database', () => {
    expect(
      getSafeTestDatabase({
        NODE_ENV: 'test',
        E2E_DATABASE_URL: 'postgres://user:password@127.0.0.1:5432/nest_typeorm_test',
      }),
    ).toEqual({
      databaseName: 'nest_typeorm_test',
      isLoopback: true,
      url: 'postgres://user:password@127.0.0.1:5432/nest_typeorm_test',
    });
  });

  it.each([
    {
      environment: {
        NODE_ENV: 'development',
        E2E_DATABASE_URL: 'postgres://localhost/nest_typeorm_test',
      },
      message: 'NODE_ENV=test',
    },
    {
      environment: { NODE_ENV: 'test' },
      message: 'E2E_DATABASE_URL is required',
    },
    {
      environment: {
        NODE_ENV: 'test',
        E2E_DATABASE_URL: 'postgres://localhost/nest_typeorm',
      },
      message: 'test or e2e segment',
    },
    {
      environment: {
        NODE_ENV: 'test',
        E2E_DATABASE_URL: 'postgres://database.example.com/nest_typeorm_test',
      },
      message: 'Remote E2E database reset is blocked',
    },
  ])('rejects an unsafe database configuration: $message', ({ environment, message }) => {
    expect(() => getSafeTestDatabase(environment)).toThrow(message);
  });

  it('requires an explicit opt-in before accepting a remote test database', () => {
    expect(
      getSafeTestDatabase({
        NODE_ENV: 'test',
        E2E_DATABASE_URL: 'postgres://database.example.com/nest_typeorm_e2e',
        E2E_ALLOW_REMOTE_DATABASE_RESET: 'true',
      }),
    ).toEqual({
      databaseName: 'nest_typeorm_e2e',
      isLoopback: false,
      url: 'postgres://database.example.com/nest_typeorm_e2e',
    });
  });
});
