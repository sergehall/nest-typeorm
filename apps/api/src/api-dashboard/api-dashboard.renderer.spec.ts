import { renderApiDashboard } from './api-dashboard.renderer';
import { HealthResponseDto } from '../health/dto/health-response.dto';
import { API_OPERATION_COUNT, API_VERSION } from '../api-documentation/swagger.config';

function createHealth(status: HealthResponseDto['status']): HealthResponseDto {
  const databaseIsUp = status === 'healthy';

  return {
    status,
    service: 'NestLab API',
    version: API_VERSION,
    environment: 'test',
    timestamp: '2026-08-20T20:45:00.000Z',
    uptimeSeconds: 42,
    checks: {
      api: {
        status: 'up',
        message: 'NestJS is accepting HTTP requests.',
        responseTimeMs: 0,
      },
      database: {
        status: databaseIsUp ? 'up' : 'down',
        message: databaseIsUp
          ? 'PostgreSQL accepted a validation query.'
          : 'PostgreSQL is unavailable.',
        responseTimeMs: databaseIsUp ? 7 : null,
      },
    },
  };
}

describe('API dashboard renderer', () => {
  it('renders health, documentation, route, and web application navigation', () => {
    const html = renderApiDashboard({
      health: createHealth('healthy'),
      webUrl: 'http://localhost:3000',
    });

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('All systems operational');
    expect(html).toContain('PostgreSQL database');
    expect(html).toContain(`${API_OPERATION_COUNT}</strong><span>operations`);
    expect(html).toContain(`/api/docs/openapi.json`);
    expect(html).toContain(`/api/docs/openapi.yaml`);
    expect(html).toContain(`<code>/health</code>`);
    expect(html).toContain(`href="http://localhost:3000"`);
  });

  it('renders a degraded state and escapes configurable web origins', () => {
    const html = renderApiDashboard({
      health: createHealth('degraded'),
      webUrl: 'https://example.com/?value=<unsafe>',
    });

    expect(html).toContain('Service degraded');
    expect(html).toContain('https://example.com/?value=&lt;unsafe&gt;');
    expect(html).not.toContain('value=<unsafe>');
  });
});
