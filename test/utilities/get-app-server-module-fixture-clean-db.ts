import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModuleOptions } from '../../src/config/db/postgres/orm-module-options';
import { AppModule } from '../../src/app.module';
import { createApp } from '../../src/create-app';
import { DataSource } from 'typeorm';
import Configuration from '../../src/config/configuration';

const ownerNameDb =
  Configuration.getConfiguration().db.pg.authConfig.PG_HEROKU_USER_NAME;

export const getAppServerModuleFixtureCleanDb = async () => {
  let app: INestApplication;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRootAsync({
        useClass: OrmModuleOptions,
      }),
      AppModule,
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  app = createApp(app); // Assuming this function configures the app
  await app.init();
  const server = app.getHttpServer();

  const dataSours = await app.resolve(DataSource);
  await dataSours.query(`CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
    DECLARE
        statements CURSOR FOR
            SELECT tablename FROM pg_tables
            WHERE tableowner = username AND schemaname = 'public';
    BEGIN
        FOR stmt IN statements LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    SELECT truncate_tables('${ownerNameDb}');
    `);

  return { app, server, moduleFixture };
};
