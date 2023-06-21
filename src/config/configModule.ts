import { ConfigModule } from '@nestjs/config';
import { envFilePath } from '../detect-env';
import { getConfiguration } from './configuration';
import * as Joi from 'joi';
import { EnvNamesEnums } from './throttle/enums/env-names.enums';

export const configModule = ConfigModule.forRoot({
  cache: true,
  isGlobal: true,
  envFilePath: envFilePath,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid(
      EnvNamesEnums.DEVELOPMENT,
      EnvNamesEnums.PRODUCTION,
      EnvNamesEnums.TEST,
    ),
    MONGO_URI_LOCAL: Joi.string().uri().min(10).max(23).required(),
    ATLAS_URI: Joi.string().uri().min(10).max(63).required(),
    TEST_DATABASE: Joi.string()
      .pattern(new RegExp('^[-a-zA-Z0-9]{7}$'))
      .required(),
    DEV_DATABASE: Joi.string()
      .pattern(new RegExp('^[-a-zA-Z0-9]{16}$'))
      .required(),
    PROD_NEST_DATABASE: Joi.string()
      .pattern(new RegExp('^[-a-zA-Z0-9]{15}$'))
      .required(),
    NODEMAILER_EMAIL: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
      })
      .required(),
    NODEMAILER_APP_PASSWORD: Joi.string().min(8).max(35).required(),
    MAIL_HOST: Joi.string().min(10).max(20).required(),
    EMAIL_PORT: Joi.number().required(),
    ACCESS_SECRET_KEY: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{15,100}$'))
      .required(),
    REFRESH_SECRET_KEY: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{15,100}$'))
      .required(),
    EXP_ACC_TIME: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{1,10}$'))
      .required(),
    EXP_REF_TIME: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{1,10}$'))
      .required(),
    BASIC_AUTH: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{16}$'))
      .required(),
    THROTTLE_TTL: Joi.number().required(),
    THROTTLE_LIMIT: Joi.number().required(),
    PORT: Joi.number().default(5000),
    PG_URI_LOCAL: Joi.string().min(9).max(9).required(),
    PG_HOST_HEROKU: Joi.string().min(41).max(41).required(),
    DATABASE_URL: Joi.string().min(10).max(170).required(),
    PG_HEROKU_USER_NAME: Joi.string()
      .min(2)
      .max(50)
      .pattern(new RegExp('^[a-zA-Z0-9]'))
      .required(),
    PG_HEROKU_USER_PASSWORD: Joi.string().min(2).max(70).required(),
    PG_LOCAL_USER_NAME: Joi.string()
      .min(2)
      .max(20)
      .pattern(new RegExp('^[a-zA-Z0-9]'))
      .required(),
    PG_LOCAL_USER_PASSWORD: Joi.string().min(2).max(20).required(),
    PG_PORT: Joi.number().default(5432),
    PG_NEST_HEROKU_DATABASE: Joi.string()
      .pattern(new RegExp('^[-a-zA-Z0-9]{14}$'))
      .required(),
  }),
  load: [getConfiguration],
});
