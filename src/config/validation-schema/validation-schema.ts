import * as Joi from 'joi';
import { EnvNamesEnums } from '../enums/envNames.enums';

export const validationSchema = Joi.object({
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
  PG_HEROKU_NAME_DATABASE: Joi.string()
    .pattern(new RegExp('^[-a-zA-Z0-9]{14}$'))
    .required(),
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
