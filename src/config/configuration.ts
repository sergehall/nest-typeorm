import { EnvNamesEnums } from './enums/env-names.enums';

class Configuration {
  private static readEnvVariableWithDefault(variable: string, defaultValue: any) {
    return process.env[variable] || defaultValue;
  }

  private static getEnvName(): string {
    return this.readEnvVariableWithDefault('NODE_ENV', EnvNamesEnums.DEVELOPMENT);
  }

  private static getPort(): number {
    return Number(this.readEnvVariableWithDefault('PORT', 5005));
  }

  private static getDatabaseURL(): string {
    return this.readEnvVariableWithDefault('DATABASE_URL', 'localhost');
  }

  private static getMongoUriLocal(): string {
    return this.readEnvVariableWithDefault('MONGO_URI_LOCAL', 'localhost://0.0.0.0');
  }

  private static getMongoUriAtlas(): string {
    return this.readEnvVariableWithDefault('ATLAS_URI', 'localhost://0.0.0.0');
  }

  private static getNestDB(): string {
    return this.readEnvVariableWithDefault('NEST_DATABASE', 'Test-DB');
  }

  private static geTestDB(): string {
    return this.readEnvVariableWithDefault('TEST_DATABASE', 'Test-DB');
  }

  private static geDevDB(): string {
    return this.readEnvVariableWithDefault('DEV_DATABASE', 'Test-DB');
  }

  private static getProdDB(): string {
    return this.readEnvVariableWithDefault('PROD_NEST_DATABASE', 'Test-DB');
  }

  private static getNodeMailerEmail(): string {
    return this.readEnvVariableWithDefault('NODEMAILER_EMAIL', 'test@gmail.com');
  }

  private static getNodeMailerAppPassword(): string {
    return this.readEnvVariableWithDefault('NODEMAILER_APP_PASSWORD', 'test');
  }

  private static getNodeMailerHost(): string {
    return this.readEnvVariableWithDefault('MAIL_HOST', 'test.gmail.com');
  }

  private static getNodeMailerPort(): number {
    return Number(this.readEnvVariableWithDefault('EMAIL_PORT', 465));
  }

  private static getAccessSecretKey(): string {
    return this.readEnvVariableWithDefault('ACCESS_SECRET_KEY', 'ACCESS_SECRET');
  }

  private static getRefreshSecretKey(): string {
    return this.readEnvVariableWithDefault('REFRESH_SECRET_KEY', 'REFRESH_SECRET');
  }

  private static getAccessExpTime(): string {
    return this.readEnvVariableWithDefault('EXP_ACC_TIME', '300s');
  }

  private static getRefreshExpTime(): string {
    return this.readEnvVariableWithDefault('EXP_REF_TIME', '600s');
  }

  private static getBasicAuth(): string {
    return this.readEnvVariableWithDefault('BASIC_AUTH', 'BASIC_SECRET');
  }

  private static getSaLogin(): string {
    return this.readEnvVariableWithDefault('SA_LOGIN', 'SA_LOGIN');
  }

  private static getSaKey(): string {
    return this.readEnvVariableWithDefault('SA_KEY', 'SA_KEY');
  }

  private static getSaPasswordHash(): string {
    return this.readEnvVariableWithDefault('SA_PASSWORD_HASH', 'SA_PASSWORD_HASH');
  }

  private static getSaEmail(): string {
    return this.readEnvVariableWithDefault('SA_EMAIL', 'SA_EMAIL');
  }

  private static getPgHerokuDomain(): string {
    return this.readEnvVariableWithDefault('PG_DOMAIN_HEROKU', 'local');
  }

  private static getThrottleTTL(): number {
    return Number(this.readEnvVariableWithDefault('THROTTLE_TTL', 10));
  }

  private static getThrottleLIMIT(): number {
    return Number(this.readEnvVariableWithDefault('THROTTLE_LIMIT', 5));
  }

  private static getSaltFactor(): number {
    return Number(this.readEnvVariableWithDefault('SALT_FACTOR', 10));
  }

  private static getTestStripeApiKey(): string {
    return this.readEnvVariableWithDefault('STRIPE_TEST_API_KEY', 'STRIPE_TEST_API_KEY');
  }

  private static getPayPalWebHookId(): string {
    return this.readEnvVariableWithDefault('PAYPAL_WEBHOOK_ID', 'PAYPAL_WEBHOOK_ID');
  }
  private static getPayPalClientSecret(): string {
    return this.readEnvVariableWithDefault('PAYPAL_CLIENT_SECRET', 'PAYPAL_CLIENT_SECRET');
  }
  private static getPayPalClientId(): string {
    return this.readEnvVariableWithDefault('PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_ID');
  }

  private static getReCaptchaSiteKey(): string {
    return this.readEnvVariableWithDefault('RECAPTCHA_SITE_KEY', 'RECAPTCHA_SITE_KEY');
  }

  private static getReCaptchaSecretKey(): string {
    return this.readEnvVariableWithDefault('RECAPTCHA_SECRET_KEY', 'RECAPTCHA_SECRET_KEY');
  }

  private static getLiveStripeApiKey(): string {
    return this.readEnvVariableWithDefault('STRIPE_LIVE_API_KEY', 'STRIPE_LIVE_API_KEY');
  }

  private static getStripeApiVersion(): string {
    return this.readEnvVariableWithDefault('STRIPE_API_VERSION', '2026-04-22.dahlia');
  }
  private static getStripeWebhookSecret(): string {
    return this.readEnvVariableWithDefault('STRIPE_WEBHOOK_SECRET', 'STRIPE_WEBHOOK_SECRET');
  }

  private static getAwsAccessKeyId(): string {
    return this.readEnvVariableWithDefault('ACCESS_KEY_ID', 'ACCESS_KEY_ID');
  }

  private static getAwsAccessSecretKey(): string {
    return this.readEnvVariableWithDefault('SECRET_ACCESS_KEY', 'SECRET_ACCESS_KEY');
  }

  private static getS3PrivateBucket(): string {
    return this.readEnvVariableWithDefault('S3_BUCKET', 'S3_BUCKET');
  }

  private static getS3PublicBucket(): string {
    return this.readEnvVariableWithDefault('S3_PUBLIC_BUCKET', 'S3_PUBLIC_BUCKET');
  }

  private static getEndpointNameAws(): string {
    return this.readEnvVariableWithDefault('AWS_ENDPOINT', 'AWS_ENDPOINT');
  }

  private static getS3Region(): string {
    return this.readEnvVariableWithDefault('S3_REGION', 'S3_REGION');
  }

  private static getTokenTelegramItIncubator(): string {
    return this.readEnvVariableWithDefault(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
  }

  private static getTelegramBotUsername(): string {
    return this.readEnvVariableWithDefault('TELEGRAM_BOT_USERNAME', 'TELEGRAM_BOT_USERNAME');
  }

  private static getTelegramBotChatId(): string {
    return this.readEnvVariableWithDefault('TELEGRAM_BOT_CHAT_ID', 'TELEGRAM_BOT_CHAT_ID');
  }

  static getConfiguration() {
    const ENV = Configuration.getEnvName();
    return {
      ENV: ENV,
      PORT: Configuration.getPort(),
      db: {
        postgres: {
          DATABASE_URL: Configuration.getDatabaseURL(),
          PG_DOMAIN_HEROKU: Configuration.getPgHerokuDomain(),
        },
        mongo: {
          MONGO_URI_LOCAL: Configuration.getMongoUriLocal(),
          ATLAS_URI: Configuration.getMongoUriAtlas(),
          NEST_DATABASE: Configuration.getNestDB(),
          TEST_DATABASE: Configuration.geTestDB(),
          DEV_DATABASE: Configuration.geDevDB(),
          PROD_NEST_DATABASE: Configuration.getProdDB(),
        },
        aws: {
          ACCESS_KEY_ID: Configuration.getAwsAccessKeyId(),
          SECRET_ACCESS_KEY: Configuration.getAwsAccessSecretKey(),
          AWS_ENDPOINT: Configuration.getEndpointNameAws(),
          S3_PRIVATE_BUCKET: Configuration.getS3PrivateBucket(),
          S3_PUBLIC_BUCKET: Configuration.getS3PublicBucket(),
          S3_REGION: Configuration.getS3Region(),
        },
      },
      mail: {
        NODEMAILER_EMAIL: Configuration.getNodeMailerEmail(),
        NODEMAILER_APP_PASSWORD: Configuration.getNodeMailerAppPassword(),
        MAIL_HOST: Configuration.getNodeMailerHost(),
        EMAIL_PORT: Configuration.getNodeMailerPort(),
      },
      jwt: {
        ACCESS_SECRET_KEY: Configuration.getAccessSecretKey(),
        REFRESH_SECRET_KEY: Configuration.getRefreshSecretKey(),
        EXP_ACC_TIME: Configuration.getAccessExpTime(),
        EXP_REF_TIME: Configuration.getRefreshExpTime(),
      },
      sa: {
        BASIC_AUTH: Configuration.getBasicAuth(),
        SA_LOGIN: Configuration.getSaLogin(),
        SA_EMAIL: Configuration.getSaEmail(),
        SA_KEY: Configuration.getSaKey(),
        SA_PASSWORD_HASH: Configuration.getSaPasswordHash(),
      },
      throttle: {
        THROTTLE_TTL: Configuration.getThrottleTTL(),
        THROTTLE_LIMIT: Configuration.getThrottleLIMIT(),
      },
      bcrypt: {
        SALT_FACTOR: Configuration.getSaltFactor(),
      },
      telegram: {
        TOKEN_TELEGRAM_IT_INCUBATOR: Configuration.getTokenTelegramItIncubator(),
        TELEGRAM_BOT_USERNAME: Configuration.getTelegramBotUsername(),
        TELEGRAM_BOT_CHAT_ID: Configuration.getTelegramBotChatId(),
      },
      stripe: {
        STRIPE_TEST_API_KEY: Configuration.getTestStripeApiKey(),
        STRIPE_LIVE_API_KEY: Configuration.getLiveStripeApiKey(),
        STRIPE_API_VERSION: Configuration.getStripeApiVersion(),
        STRIPE_WEBHOOK_SECRET: Configuration.getStripeWebhookSecret(),
      },
      paypal: {
        PAYPAL_WEBHOOK_ID: Configuration.getPayPalWebHookId(),
        PAYPAL_CLIENT_SECRET: Configuration.getPayPalClientSecret(),
        PAYPAL_CLIENT_ID: Configuration.getPayPalClientId(),
      },
      reCaptcha: {
        RECAPTCHA_SITE_KEY: Configuration.getReCaptchaSiteKey(),
        RECAPTCHA_SECRET_KEY: Configuration.getReCaptchaSecretKey(),
      },
    };
  }
}

export type ConfigType = ReturnType<typeof Configuration.getConfiguration>;

export default Configuration;
