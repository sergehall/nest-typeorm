import * as Joi from 'joi';
import { EnvNamesEnums } from './enums/env-names.enums';

export const validationSchemaConfiguration = Joi.object({
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
  BASIC_AUTH: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{16}$')).required(),
  SA_LOGIN: Joi.string().min(5).max(5).required(),
  SA_EMAIL: Joi.string().min(15).max(15).email().required(),
  SA_KEY: Joi.string().min(44).max(44).required(),
  SA_PASSWORD_HASH: Joi.string().min(100).max(100).required(),
  THROTTLE_TTL: Joi.number().required(),
  THROTTLE_LIMIT: Joi.number().required(),
  PORT: Joi.number().default(5000),
  PG_URI_LOCAL: Joi.string().min(9).max(9).required(),
  PG_HOST_HEROKU: Joi.string().min(63).max(63).required(),
  DATABASE_URL: Joi.string()
    .min(174)
    .max(174)
    .pattern(
      new RegExp(
        '^postgres:\\/\\/[a-zA-Z0-9]+:[\\w\\W]+@[a-zA-Z0-9.-]+:[0-9]+\\/[a-zA-Z0-9]+$',
      ),
    )
    .required(),
  PG_HEROKU_USER_NAME: Joi.string()
    .min(14)
    .max(14)
    .pattern(new RegExp('^[a-zA-Z0-9]'))
    .required(),
  PG_HEROKU_NAME_DATABASE: Joi.string()
    .pattern(new RegExp('^[-a-zA-Z0-9]{13}$'))
    .required(),
  PG_HEROKU_USER_PASSWORD: Joi.string().min(65).max(65).required(),
  PG_DOMAIN_HEROKU: Joi.string()
    .pattern(
      new RegExp(
        '^https:\\/\\/([a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}(:[0-9]+)?(\\/.*)?$',
      ),
    )
    .required(),
  PG_LOCAL_USER_NAME: Joi.string()
    .min(2)
    .max(20)
    .pattern(new RegExp('^[a-zA-Z0-9]'))
    .required(),
  PG_LOCAL_USER_PASSWORD: Joi.string().min(2).max(20).required(),
  PG_PORT: Joi.number().default(5432),
  ACCESS_KEY_ID: Joi.string().min(20).max(20).required(),
  SECRET_ACCESS_KEY: Joi.string().min(40).max(40).required(),
  AWS_ENDPOINT: Joi.string().min(34).max(34).required(),
  S3_REGION: Joi.string().min(9).max(9).required(),
  S3_PRIVATE_BUCKET: Joi.string().min(8).max(8).required(),
  S3_PUBLIC_BUCKET: Joi.string().min(23).max(23).required(),
  TOKEN_TELEGRAM_IT_INCUBATOR: Joi.string().min(46).max(46).required(),
  TELEGRAM_BOT_USERNAME: Joi.string().min(14).max(14).required(),
  TELEGRAM_BOT_CHAT_ID: Joi.string().min(9).max(9).required(),
  STRIPE_TEST_API_KEY: Joi.string().min(107).max(107).required(),
  STRIPE_LIVE_API_KEY: Joi.string().min(107).max(107).required(),
  STRIPE_API_VERSION: Joi.string().min(10).max(10).required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().min(38).max(38).required(),
  RECAPTCHA_SITE_KEY: Joi.string().min(40).max(40).required(),
  RECAPTCHA_SECRET_KEY: Joi.string().min(40).max(40).required(),
}).options({
  abortEarly: false,
  messages: {
    'any.required': 'The {{#label}} environment variable is required.',
    'string.base': 'The {{#label}} environment variable must be a string.',
    'string.min':
      'The {{#label}} environment variable must be at least {{#limit}} characters long.',
    'string.max':
      'The {{#label}} environment variable must be at most {{#limit}} characters long.',
    'number.base': 'The {{#label}} environment variable must be a number.',
    'number.default':
      'Invalid value provided for the {{#label}} environment variable.',
    'string.uri': 'The {{#label}} environment variable must be a valid URI.',
    'string.email':
      'The {{#label}} environment variable must be a valid email address.',
    'number.min':
      'The {{#label}} environment variable must be at least {{#limit}}.',
    'number.max':
      'The {{#label}} environment variable must be at most {{#limit}}.',
    // Add more custom messages as needed
  },
});
