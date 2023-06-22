import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConfiguration } from '../configuration';
import { AuthPgEntity } from '../../auth-pg/auth-pg.entity';

export const ormConfig: {
  localHost: TypeOrmModuleOptions;
  herokuPosgreSql: TypeOrmModuleOptions;
} = {
  localHost: {
    type: 'postgres' as const,
    host: getConfiguration().db.pg.host.local.PG_URI_LOCAL,
    port: getConfiguration().db.pg.port.PG_PORT,
    username: 'serge-nodejs',
    password: getConfiguration().auth.PG_LOCAL_USER_PASSWORD,
    database: 'Local-Nest-pg-DB',
    ssl: { rejectUnauthorized: false },
    entities: [AuthPgEntity],
    synchronize: true,
    logging: false,
  },
  herokuPosgreSql: {
    type: 'postgres' as const,
    host: getConfiguration().db.pg.host.heroku.PG_HOST_HEROKU,
    port: getConfiguration().db.pg.port.PG_PORT,
    username: getConfiguration().auth.PG_HEROKU_USER_NAME,
    password: getConfiguration().auth.PG_HEROKU_USER_PASSWORD,
    database: getConfiguration().db.nameDatabase.PG_NEST_HEROKU_DATABASE,
    ssl: { rejectUnauthorized: false },
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  },
};
