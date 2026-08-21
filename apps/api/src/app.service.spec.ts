import { DataSource } from 'typeorm';
import { AppService } from './app.service';

function createDataSource(overrides: Partial<DataSource> = {}): DataSource {
  return {
    isInitialized: true,
    query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    ...overrides,
  } as unknown as DataSource;
}

describe('AppService health', () => {
  it('reports a healthy service after PostgreSQL accepts a validation query', async () => {
    const dataSource = createDataSource();
    const service = new AppService(dataSource);

    const health = await service.getHealth();

    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    expect(health.status).toBe('healthy');
    expect(health.checks.api.status).toBe('up');
    expect(health.checks.database).toMatchObject({
      status: 'up',
      message: 'PostgreSQL accepted a validation query.',
    });
  });

  it('reports a degraded service without exposing database connection errors', async () => {
    const dataSource = createDataSource({
      query: jest.fn().mockRejectedValue(new Error('secret-host:5432 rejected credentials')),
    });
    const service = new AppService(dataSource);

    const health = await service.getHealth();

    expect(health.status).toBe('degraded');
    expect(health.checks.api.status).toBe('up');
    expect(health.checks.database).toMatchObject({
      status: 'down',
      message: 'PostgreSQL is unavailable.',
    });
    expect(JSON.stringify(health)).not.toContain('secret-host');
  });

  it('reports a degraded service when TypeORM is not initialized', async () => {
    const dataSource = createDataSource({ isInitialized: false });
    const service = new AppService(dataSource);

    const health = await service.getHealth();

    expect(dataSource.query).not.toHaveBeenCalled();
    expect(health.status).toBe('degraded');
    expect(health.checks.database.status).toBe('down');
  });
});
