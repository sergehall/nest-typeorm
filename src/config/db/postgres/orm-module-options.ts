import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostgresConfig } from './postgres.config';
import { Users } from '../../../features/users/entities/users.entity';
import { SecurityDevices } from '../../../features/security-devices/entities/session-devices.entity';

@Injectable()
export class OrmModuleOptions
  extends PostgresConfig
  implements TypeOrmOptionsFactory
{
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const host = await this.getHost('PG_HOST_HEROKU');
    const port = await this.getPort('PG_PORT');
    const username = await this.getAuth('PG_HEROKU_USER_NAME');
    const password = await this.getAuth('PG_HEROKU_USER_PASSWORD');
    const database = await this.getNamesDatabase('PG_HEROKU_NAME_DATABASE');

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      entities: [Users, SecurityDevices],
      synchronize: true,
      logging: false,
    };
  }
}
