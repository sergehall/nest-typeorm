import { EnvNamesEnums } from '../infrastructure/database/enums/env-names.enums';

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
  };
};
