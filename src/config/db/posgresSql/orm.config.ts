import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../../base/base-config';
import { DbConfigTypes } from '../types/db.types';

@Injectable()
export class OrmConfig extends BaseConfig implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const dbConfig: DbConfigTypes = await this.getValueDatabase();

    const host = dbConfig.pg.host.PG_HOST_HEROKU;
    const port = dbConfig.pg.port.PG_PORT;
    const username = dbConfig.pg.authConfig.PG_HEROKU_USER_NAME;
    const password = dbConfig.pg.authConfig.PG_HEROKU_USER_PASSWORD;
    const database = dbConfig.pg.namesDatabase.PG_HEROKU_NAME_DATABASE;

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      entities: [],
      synchronize: true,
      logging: false,
    };
  }
}
