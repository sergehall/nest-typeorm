import { EnvNamesEnums } from './enums/env-names.enums';

export const getConfiguration = () => {
  return {
    ENV: process.env.NODE_ENV || EnvNamesEnums.DEVELOPMENT,
    mongoose: {
      uri: {
        ATLAS_URI: process.env.ATLAS_URI,
        MONGO_URI: process.env.MONGO_URI,
      },
    },
    database: {
      NEST_DATABASE: process.env.NEST_DATABASE,
      TEST_DATABASE: process.env.TEST_DATABASE,
      DEV_DATABASE: process.env.DEV_DATABASE,
      PROD_NEST_DATABASE: process.env.PROD_NEST_DATABASE,
    },
    mail: {
      NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
    },
    jwt: {
      ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY,
      REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY,
      EXP_ACC_TIME: process.env.EXP_ACC_TIME,
      EXP_REF_TIME: process.env.EXP_REF_TIME,
    },
    auth: {
      BASIC_AUTH: process.env.BASIC_AUTH,
    },
    throttle: {
      THROTTLE_TTL: process.env.THROTTLE_TTL,
      THROTTLE_LIMIT: process.env.THROTTLE_LIMIT,
    },
  };
};
