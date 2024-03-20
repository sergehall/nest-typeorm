import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseConfig } from '../../base/base.config';
import { PgKeysType } from './types/pg-keys.type';
import { PgPortKeyType } from './types/pg-port-key.type';

@Injectable()
export class PostgresConfig extends BaseConfig {
  private config: Record<string, string> = {
    PG_URI_LOCAL: 'PG_URI_LOCAL',
    PG_HOST_HEROKU: 'PG_HOST_HEROKU',
    PG_LOCAL_DATABASE: 'PG_LOCAL_DATABASE',
    PG_HEROKU_NAME_DATABASE: 'PG_HEROKU_NAME_DATABASE',
    PG_LOCAL_USER_NAME: 'PG_LOCAL_USER_NAME',
    PG_LOCAL_USER_PASSWORD: 'PG_LOCAL_USER_PASSWORD',
    PG_HEROKU_USER_NAME: 'PG_HEROKU_USER_NAME',
    PG_HEROKU_USER_PASSWORD: 'PG_HEROKU_USER_PASSWORD',
    PG_DOMAIN_HEROKU: 'PG_DOMAIN_HEROKU',
  };

  private async getPostgresValue(key: PgKeysType): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getValuePostgresByKey(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in Postgres configuration`,
      );
    }
  }

  async getPostgresConfig(key: PgKeysType): Promise<string> {
    return this.getPostgresValue(key);
  }

  async getPort(key: PgPortKeyType): Promise<number> {
    return await this.getValuePgPort(key);
  }
}
