import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigType } from '../../configuration';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrmConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<ConfigType, true>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const host = this.configService.get('dbConfig', {
      infer: true,
    }).pg.host.PG_HOST_HEROKU;
    const port = this.configService.get('dbConfig', {
      infer: true,
    }).pg.port.PG_PORT;
    const username = this.configService.get('dbConfig', {
      infer: true,
    }).pg.authConfig.PG_HEROKU_USER_NAME;
    const password = this.configService.get('dbConfig', {
      infer: true,
    }).pg.authConfig.PG_HEROKU_USER_PASSWORD;
    const database = this.configService.get('dbConfig', {
      infer: true,
    }).pg.namesDatabase.PG_HEROKU_NAME_DATABASE;
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
