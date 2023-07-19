import { EnvNamesEnums } from './throttle/enums/env-names.enums';
import { NumberThrottlerEnums } from './throttle/enums/number-throttler.enums';

export const getConfiguration = () => {
  return {
    ENV: process.env.NODE_ENV || EnvNamesEnums.DEVELOPMENT,
    PORT: Number(process.env.PORT) || 5000,
    db: {
      pg: {
        url: {
          DATABASE_URL: process.env.DATABASE_URL || 'localhost',
        },
        host: {
          local: {
            PG_URI_LOCAL: process.env.PG_URI_LOCAL || 'localhost',
          },
          heroku: {
            PG_HOST_HEROKU: process.env.PG_HOST_HEROKU || 'localhost',
          },
        },
        port: {
          PG_PORT: Number(process.env.PG_PORT) || 5432,
        },
      },
      mongo: {
        local: {
          MONGO_URI_LOCAL: process.env.MONGO_URI_LOCAL || 'localhost://0.0.0.0',
        },
        atlas: {
          ATLAS_URI: process.env.ATLAS_URI || 'localhost://0.0.0.0',
        },
      },
      nameDatabase: {
        NEST_DATABASE: process.env.NEST_DATABASE || 'Test-DB',
        TEST_DATABASE: process.env.TEST_DATABASE || 'Test-DB',
        DEV_DATABASE: process.env.DEV_DATABASE || 'Test-DB',
        PROD_NEST_DATABASE: process.env.PROD_NEST_DATABASE || 'Test-DB',
        PG_NEST_LOCAL_DATABASE: process.env.PG_NEST_LOCAL_DATABASE || 'nest-pg',
        PG_NEST_HEROKU_DATABASE:
          process.env.PG_NEST_HEROKU_DATABASE || 'nest-pg',
      },
    },
    mail: {
      NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL || 'test@gmail.com',
      NODEMAILER_APP_PASSWORD: process.env.NODEMAILER_APP_PASSWORD || 'test',
      MAIL_HOST: process.env.MAIL_HOST || 'test.gmail.com',
      EMAIL_PORT: Number(process.env.EMAIL_PORT) || 465,
    },
    jwt: {
      ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY || 'ACCESS_SECRET',
      REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY || 'REFRESH_SECRET',
      EXP_ACC_TIME: process.env.EXP_ACC_TIME || '300s',
      EXP_REF_TIME: process.env.EXP_REF_TIME || '600s',
    },
    auth: {
      BASIC_AUTH: process.env.BASIC_AUTH || 'BASIC_SECRET',
      PG_LOCAL_USER_NAME: process.env.PG_LOCAL_USER_NAME || 'postgres',
      PG_LOCAL_USER_PASSWORD: process.env.PG_LOCAL_USER_PASSWORD || 'sa',
      PG_HEROKU_USER_NAME: process.env.PG_HEROKU_USER_NAME || 'postgres',
      PG_HEROKU_USER_PASSWORD: process.env.PG_HEROKU_USER_PASSWORD || 'sa',
    },
    throttle: {
      THROTTLE_TTL:
        Number(process.env.THROTTLE_TTL) || NumberThrottlerEnums.THROTTLE_TTL,
      THROTTLE_LIMIT:
        Number(process.env.THROTTLE_LIMIT) ||
        NumberThrottlerEnums.THROTTLE_LIMIT,
    },
    bcrypt: {
      SALT_FACTOR: Number(process.env.SALT_FACTOR),
    },
  };
};

export type ConfigurationConfigType = ReturnType<typeof getConfiguration>;
export type ConfigType = ConfigurationConfigType & {
  ENV:
    | EnvNamesEnums.DEVELOPMENT
    | EnvNamesEnums.PRODUCTION
    | EnvNamesEnums.TEST;
  MONGO_URI: string;
  ATLAS_URI: string;
  NEST_DATABASE: string;
  TEST_DATABASE: string;
  DEV_DATABASE: string;
  PROD_NEST_DATABASE: string;
  NODEMAILER_EMAIL: string;
  NODEMAILER_APP_PASSWORD: string;
  MAIL_HOST: string;
  EMAIL_PORT: number;
  ACCESS_SECRET_KEY: string;
  REFRESH_SECRET_KEY: string;
  EXP_ACC_TIME: string;
  EXP_REF_TIME: string;
  BASIC_AUTH: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
  PG_URI_LOCAL: string;
  PG_HOST_HEROKU: string;
  DATABASE_URL: string;
  PG_NEST_HEROKU_DATABASE: string;
  PG_HEROKU_USER_NAME: string;
  PG_HEROKU_USER_PASSWORD: string;
  PG_LOCAL_USER_NAME: string;
  PG_LOCAL_USER_PASSWORD: string;
  PG_PORT: number;
  PG_NEST_LOCAL_DATABASE: string;
  SALT_FACTOR: number;
};
