import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseConfig } from '../../base/base.config';
import { PgKeysType } from './types/pg-keys.type';

@Injectable()
export class PostgresConfig extends BaseConfig {
  private config: Record<string, string> = {
    DATABASE_URL: 'DATABASE_URL',
    PG_DOMAIN_HEROKU: 'PG_DOMAIN_HEROKU',
  };

  private async getPostgresValue(key: PgKeysType): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getValuePostgresByKey(key);
    } else {
      throw new BadRequestException(`Key ${key} not found in Postgres configuration`);
    }
  }

  async getPostgresConfig(key: PgKeysType): Promise<string> {
    return this.getPostgresValue(key);
  }
}
