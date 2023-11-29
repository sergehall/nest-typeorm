import { EnvNamesEnums } from './enums/env-names.enums';

class Configuration {
  private static readEnvVariableWithDefault(
    variable: string,
    defaultValue: any,
  ) {
    return process.env[variable] || defaultValue;
  }

  private static getEnvName(): string {
    return this.readEnvVariableWithDefault(
      'NODE_ENV',
      EnvNamesEnums.DEVELOPMENT,
    );
  }

  private static getPort(): number {
    return Number(this.readEnvVariableWithDefault('PORT', 5000));
  }

  private static getDatabaseURL(): string {
    return this.readEnvVariableWithDefault('DATABASE_URL', 'localhost');
  }

  private static getUriHostLocal(): string {
    return this.readEnvVariableWithDefault('PG_URI_LOCAL', 'localhost');
  }

  private static getUriHostHeroku(): string {
    return this.readEnvVariableWithDefault('PG_HOST_HEROKU', 'localhost');
  }

  private static getPgPort(): number {
    return Number(this.readEnvVariableWithDefault('PG_PORT', 5432));
  }

  private static getMongoUriLocal(): string {
    return this.readEnvVariableWithDefault(
      'MONGO_URI_LOCAL',
      'localhost://0.0.0.0',
    );
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

  private static getPgLocalNameDB(): string {
    return this.readEnvVariableWithDefault('PG_NEST_LOCAL_DATABASE', 'Test-DB');
  }

  private static getPgHerokuNameDB(): string {
    return this.readEnvVariableWithDefault(
      'PG_HEROKU_NAME_DATABASE',
      'Test-DB',
    );
  }

  private static getNodeMailerEmail(): string {
    return this.readEnvVariableWithDefault(
      'NODEMAILER_EMAIL',
      'test@gmail.com',
    );
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
    return this.readEnvVariableWithDefault(
      'ACCESS_SECRET_KEY',
      'ACCESS_SECRET',
    );
  }

  private static getRefreshSecretKey(): string {
    return this.readEnvVariableWithDefault(
      'REFRESH_SECRET_KEY',
      'REFRESH_SECRET',
    );
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

  private static getPgLocalUserName(): string {
    return this.readEnvVariableWithDefault('PG_LOCAL_USER_NAME', 'postgres');
  }

  private static getPgLocalUserPassword(): string {
    return this.readEnvVariableWithDefault('PG_LOCAL_USER_PASSWORD', 'local');
  }

  private static getPgHerokuUserName(): string {
    return this.readEnvVariableWithDefault('PG_HEROKU_USER_NAME', 'postgres');
  }

  private static getPgHerokuUserPassword(): string {
    return this.readEnvVariableWithDefault('PG_HEROKU_USER_PASSWORD', 'local');
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

  private static getAwsAccessKeyId(): string {
    return this.readEnvVariableWithDefault('ACCESS_KEY_ID', 'ACCESS_KEY_ID');
  }

  private static getAwsAccessSecretKey(): string {
    return this.readEnvVariableWithDefault(
      'SECRET_ACCESS_KEY',
      'SECRET_ACCESS_KEY',
    );
  }

  private static getBucketNameHallAws(): string {
    return this.readEnvVariableWithDefault(
      'BUCKET_HALL_AWS',
      'BUCKET_HALL_AWS',
    );
  }

  static getConfiguration() {
    const ENV = Configuration.getEnvName();
    return {
      ENV: ENV,
      PORT: Configuration.getPort(),
      db: {
        pg: {
          url: {
            DATABASE_URL: Configuration.getDatabaseURL(),
          },
          host: {
            PG_URI_LOCAL: Configuration.getUriHostLocal(),
            PG_HOST_HEROKU: Configuration.getUriHostHeroku(),
          },
          port: {
            PG_PORT: Configuration.getPgPort(),
          },
          namesDatabase: {
            PG_LOCAL_DATABASE: Configuration.getPgLocalNameDB(),
            PG_HEROKU_NAME_DATABASE: Configuration.getPgHerokuNameDB(),
          },
          authConfig: {
            PG_LOCAL_USER_NAME: Configuration.getPgLocalUserName(),
            PG_LOCAL_USER_PASSWORD: Configuration.getPgLocalUserPassword(),
            PG_HEROKU_USER_NAME: Configuration.getPgHerokuUserName(),
            PG_HEROKU_USER_PASSWORD: Configuration.getPgHerokuUserPassword(),
          },
          domain: {
            PG_DOMAIN_HEROKU: Configuration.getPgHerokuDomain(),
          },
        },
        mongo: {
          url: {
            MONGO_URI_LOCAL: Configuration.getMongoUriLocal(),
            ATLAS_URI: Configuration.getMongoUriAtlas(),
          },
          namesDatabase: {
            NEST_DATABASE: Configuration.getNestDB(),
            TEST_DATABASE: Configuration.geTestDB(),
            DEV_DATABASE: Configuration.geDevDB(),
            PROD_NEST_DATABASE: Configuration.getProdDB(),
          },
        },
        aws: {
          accessKeys: {
            ACCESS_KEY_ID: Configuration.getAwsAccessKeyId(),
            SECRET_ACCESS_KEY: Configuration.getAwsAccessSecretKey(),
          },
          buckets: {
            BUCKET_HALL_AWS: Configuration.getBucketNameHallAws(),
          },
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
      basicAuth: {
        BASIC_AUTH: Configuration.getBasicAuth(),
      },
      throttle: {
        THROTTLE_TTL: Configuration.getThrottleTTL(),
        THROTTLE_LIMIT: Configuration.getThrottleLIMIT(),
      },
      bcrypt: {
        SALT_FACTOR: Configuration.getSaltFactor(),
      },
    };
  }
}

export type ConfigType = ReturnType<typeof Configuration.getConfiguration>;

export default Configuration;
