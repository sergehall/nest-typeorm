import { EnvNamesEnums } from './enums/env-names.enums';
import { NumberThrottlerEnums } from './enums/number-throttler.enums';

export const getConfiguration = () => {
  return {
    ENV: process.env.NODE_ENV || EnvNamesEnums.DEVELOPMENT,
    db: {
      mongo: {
        local: {
          MONGO_URI: process.env.MONGO_URI || 'localhost://0.0.0.0',
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
      },
    },
    mail: {
      NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL || 'test@gmail.com',
    },
    jwt: {
      ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY || 'ACCESS_SECRET',
      REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY || 'REFRESH_SECRET',
      EXP_ACC_TIME: process.env.EXP_ACC_TIME || '300s',
      EXP_REF_TIME: process.env.EXP_REF_TIME || '600s',
    },
    auth: {
      BASIC_AUTH: process.env.BASIC_AUTH || 'BASIC_SECRET',
    },
    throttle: {
      THROTTLE_TTL:
        Number(process.env.THROTTLE_TTL) || NumberThrottlerEnums.THROTTLE_TTL,
      THROTTLE_LIMIT:
        Number(process.env.THROTTLE_LIMIT) ||
        NumberThrottlerEnums.THROTTLE_LIMIT,
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
  ACCESS_SECRET_KEY: string;
  REFRESH_SECRET_KEY: string;
  EXP_ACC_TIME: string;
  EXP_REF_TIME: string;
  BASIC_AUTH: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
};
