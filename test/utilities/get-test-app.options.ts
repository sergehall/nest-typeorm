import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { createApp } from '../../src/create-app';
import { DataSource, EntityManager } from 'typeorm';
import { Server } from 'node:http';
import { getSafeTestDatabase } from './database-safety';
import { TypeOrmPostgresOptions } from '../../src/db/type-orm/options/type-orm-postgres.options';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

interface DatabaseNameRow {
  readonly database_name: string;
}

interface TableNameRow {
  readonly schemaname: string;
  readonly tablename: string;
}

export interface TestAppContext {
  readonly app: INestApplication;
  readonly dataSource: DataSource;
  readonly moduleFixture: TestingModule;
  readonly server: Server;
}

class E2eTypeOrmOptions implements TypeOrmOptionsFactory {
  constructor(
    private readonly databaseUrl: string,
    private readonly isLoopback: boolean,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.databaseUrl,
      autoLoadEntities: true,
      synchronize: true,
      ssl: this.isLoopback ? false : { rejectUnauthorized: false },
      logging: false,
    };
  }
}

const isDatabaseNameRow = (value: unknown): value is DatabaseNameRow => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'database_name' in value &&
    typeof value.database_name === 'string'
  );
};

const isTableNameRow = (value: unknown): value is TableNameRow => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'schemaname' in value &&
    typeof value.schemaname === 'string' &&
    'tablename' in value &&
    typeof value.tablename === 'string'
  );
};

const quoteIdentifier = (identifier: string): string => {
  return `"${identifier.replaceAll('"', '""')}"`;
};

const assertExpectedDatabaseConnection = async (
  entityManager: EntityManager,
  expectedDatabaseName: string,
): Promise<void> => {
  const result: unknown = await entityManager.query('SELECT current_database() AS database_name');

  if (!Array.isArray(result) || result.length !== 1 || !isDatabaseNameRow(result[0])) {
    throw new Error('Unable to verify the connected E2E database.');
  }

  if (result[0].database_name !== expectedDatabaseName) {
    throw new Error(
      `Connected database does not match E2E_DATABASE_URL: expected ${expectedDatabaseName}.`,
    );
  }
};

export const resetTestDatabase = async (dataSource: DataSource): Promise<void> => {
  const { databaseName } = getSafeTestDatabase(process.env);

  await dataSource.transaction(async (entityManager) => {
    await assertExpectedDatabaseConnection(entityManager, databaseName);

    const result: unknown = await entityManager.query(`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname = current_schema()
        AND tablename NOT IN ('migrations', 'typeorm_metadata')
      ORDER BY tablename
    `);

    if (!Array.isArray(result) || !result.every(isTableNameRow)) {
      throw new Error('Unable to enumerate tables in the E2E database.');
    }

    if (result.length === 0) {
      return;
    }

    const tables = result
      .map(({ schemaname, tablename }) => {
        return `${quoteIdentifier(schemaname)}.${quoteIdentifier(tablename)}`;
      })
      .join(', ');

    await entityManager.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
  });
};

export const getTestAppOptions = async (): Promise<TestAppContext> => {
  const { isLoopback, url } = getSafeTestDatabase(process.env);
  process.env.DATABASE_URL = url;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(TypeOrmPostgresOptions)
    .useValue(new E2eTypeOrmOptions(url, isLoopback))
    .compile();

  let app = moduleFixture.createNestApplication();
  app = createApp(app);

  try {
    await app.init();
    const dataSource = app.get(DataSource);
    await resetTestDatabase(dataSource);

    return {
      app,
      dataSource,
      moduleFixture,
      server: app.getHttpServer() as Server,
    };
  } catch (error: unknown) {
    await app.close();
    throw error;
  }
};
