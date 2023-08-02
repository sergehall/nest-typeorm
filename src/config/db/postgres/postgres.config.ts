import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../../base/base-config';
import { PgDomainNameTypes } from './types/pg-domain-name.types';
import { PgHostTypes } from './types/pg-host.types';
import { PgPortTypes } from './types/pg-port.types';
import { PgNamesDbTypes } from './types/pg-names-db.types';
import { PgAuthTypes } from './types/pg-auth.types';
import { PgDatabaseUrlTypes } from './types/pg-database-url.types';

@Injectable()
export class PostgresConfig extends BaseConfig {
  async getUrl(key: PgDatabaseUrlTypes): Promise<string> {
    return await this.getValuePgDatabaseUrl(key);
  }
  async getHost(key: PgHostTypes): Promise<string> {
    return await this.getValuePgHost(key);
  }
  async getPort(key: PgPortTypes): Promise<number> {
    return await this.getValuePgPort(key);
  }
  async getNamesDatabase(key: PgNamesDbTypes): Promise<string> {
    return await this.getValuePgNameDb(key);
  }
  async getAuth(key: PgAuthTypes): Promise<string> {
    return await this.getValuePgAuth(key);
  }
  async getDomain(key: PgDomainNameTypes): Promise<string> {
    return await this.getValuePgDomainName(key);
  }
}
