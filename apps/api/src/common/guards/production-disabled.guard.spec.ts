import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { ProductionDisabledGuard } from './production-disabled.guard';

describe('ProductionDisabledGuard', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const context = {} as ExecutionContext;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('hides educational mutation routes in production', () => {
    process.env.NODE_ENV = 'production';

    expect(() => new ProductionDisabledGuard().canActivate(context)).toThrow(NotFoundException);
  });

  it('fails closed when NODE_ENV is missing', () => {
    delete process.env.NODE_ENV;

    expect(() => new ProductionDisabledGuard().canActivate(context)).toThrow(NotFoundException);
  });

  it('keeps educational mutation routes available for local study', () => {
    process.env.NODE_ENV = 'development';

    expect(new ProductionDisabledGuard().canActivate(context)).toBe(true);
  });
});
