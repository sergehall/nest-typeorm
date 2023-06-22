import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConfiguration } from '../configuration';
import { EnvNamesEnums } from '../throttle/enums/env-names.enums';

// export const ormConfig: TypeOrmModuleOptions = {
//   type: 'postgres' as const,
//   host: getConfiguration().db.pg.host.heroku.PG_HOST_HEROKU,
//   port: getConfiguration().db.pg.port.PG_PORT,
//   username: getConfiguration().auth.PG_HEROKU_USER_NAME,
//   password: getConfiguration().auth.PG_HEROKU_USER_PASSWORD,
//   database: getConfiguration().db.nameDatabase.PG_NEST_HEROKU_DATABASE,
//   ssl:
//     getConfiguration().ENV === EnvNamesEnums.DEVELOPMENT
//       ? false
//       : { rejectUnauthorized: false },
//   entities: [__dirname + '/**/*.entity{.ts,.js}'],
//   synchronize: false,
//   logging: false,
// };
export const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres' as const,
  host: getConfiguration().db.pg.host.local.PG_URI_LOCAL,
  port: getConfiguration().db.pg.port.PG_PORT,
  username: 'serge-nodejs',
  password: getConfiguration().auth.PG_LOCAL_USER_PASSWORD,
  database: 'Local-Nest-pg-DB',
  ssl:
    getConfiguration().ENV === EnvNamesEnums.DEVELOPMENT
      ? false
      : { rejectUnauthorized: false },
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
};
