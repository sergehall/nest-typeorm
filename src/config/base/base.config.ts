import { ConfigType } from '../configuration';
import { JwtConfigType } from '../jwt/types/jwt-config.types';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottleTypes } from '../throttle/types/throttle.types';
import { MailerPortTypes, MailerTypes } from '../mailer/types/mailer.types';
import * as bcrypt from 'bcrypt';
import { EnvNamesEnums } from '../enums/env-names.enums';
import { PgDomainNameTypes } from '../db/postgres/types/pg-domain-name.types';
import { PgHostTypes } from '../db/postgres/types/pg-host.types';
import { PgPortTypes } from '../db/postgres/types/pg-port.types';
import { PgNamesDbTypes } from '../db/postgres/types/pg-names-db.types';
import { PgAuthTypes } from '../db/postgres/types/pg-auth.types';
import { MongoDatabaseConfigTypes } from '../db/mongo/types/mongo-db-config.types';
import { PgDatabaseUrlTypes } from '../db/postgres/types/pg-database-url.types';
import { BasicAuthType } from '../sa/types/basic-auth.type';
import { AwsAccessKeyType } from '../aws/types/aws-access-key.type';
import {
  S3BPublicBucketNameType,
  S3PrivateBucketNameType,
} from '../aws/types/s3-bucket-name.type';
import { AwsEndpointType } from '../aws/types/aws-endpoint.type';
import { S3RegionNameType } from '../aws/types/s3-region-name.type';
import { TokenTelegramItIncubatorType } from '../telegram/types/token-telegram-it-incubator.type';
import { SaLoginType } from '../sa/types/sa-login.type';
import { SaEmailType } from '../sa/types/sa-email.type';
import { SaKeyType } from '../sa/types/sa-key.type';
import { SaPasswordHashType } from '../sa/types/sa-password-hash.type';
import { TelegramUsernameBotType } from '../telegram/types/telegram-username-bot.type';

@Injectable()
export class BaseConfig {
  constructor(protected configService: ConfigService<ConfigType, true>) {}
  /**
   * Retrieves the value of the 'ENV' environment variable and returns it as a Promise of `EnvNamesEnums`.
   * @returns {Promise<EnvNamesEnums>} The value of the 'ENV' environment variable.
   */
  protected async getValueENV(): Promise<EnvNamesEnums> {
    return this.configService.get('ENV', {
      infer: true,
    });
  }

  protected async getEndpointName(key: AwsEndpointType): Promise<string> {
    return this.configService.get('db.aws.endpoint', {
      infer: true,
    })[key];
  }

  protected async getValueAccessKeyId(key: AwsAccessKeyType): Promise<string> {
    return this.configService.get('db.aws.accessKeys', {
      infer: true,
    })[key];
  }

  protected async getValuePrivateBucketName(
    key: S3PrivateBucketNameType,
  ): Promise<string> {
    return this.configService.get('db.aws.buckets', {
      infer: true,
    })[key];
  }

  protected async getValuePublicBucketName(
    key: S3BPublicBucketNameType,
  ): Promise<string> {
    return this.configService.get('db.aws.buckets', {
      infer: true,
    })[key];
  }

  protected async getValueRegionName(key: S3RegionNameType): Promise<string> {
    return this.configService.get('db.aws.region', {
      infer: true,
    })[key];
  }

  protected async getValueSecretAccessKey(
    key: AwsAccessKeyType,
  ): Promise<string> {
    return this.configService.get('db.aws.accessKeys', {
      infer: true,
    })[key];
  }

  protected async getTokenTelegramItIncubator(
    key: TokenTelegramItIncubatorType,
  ): Promise<string> {
    return this.configService.get('telegram', {
      infer: true,
    })[key];
  }

  protected async getTelegramUsernameBot(
    key: TelegramUsernameBotType,
  ): Promise<string> {
    return this.configService.get('telegram', {
      infer: true,
    })[key];
  }

  /**
   * Retrieves the value of the 'basicAuth' environment variable and returns it as a Promise of `string`.
   * @returns {Promise<BasicAuthType>} The value of the 'string' environment variable.
   */
  protected async getValueBasicAuth(key: BasicAuthType): Promise<string> {
    return this.configService.get('basicAuth', {
      infer: true,
    })[key];
  }

  protected async getValueSaLogin(key: SaLoginType): Promise<string> {
    return this.configService.get('basicAuth', {
      infer: true,
    })[key];
  }

  protected async getValueSaEmail(key: SaEmailType): Promise<string> {
    return this.configService.get('basicAuth', {
      infer: true,
    })[key];
  }

  protected async getValueSaSaKey(key: SaKeyType): Promise<string> {
    return this.configService.get('basicAuth', {
      infer: true,
    })[key];
  }

  protected async getValueSaPasswordHash(
    key: SaPasswordHashType,
  ): Promise<string> {
    return this.configService.get('basicAuth', {
      infer: true,
    })[key];
  }

  /**
   * Retrieves the value of the 'db' configuration property and returns it as a Promise of `MongoDatabaseConfigTypes`.
   * @returns {Promise<MongoDatabaseConfigTypes>} The value of the 'db' configuration property.
   */
  protected async getValueMongoDatabase(): Promise<MongoDatabaseConfigTypes> {
    return this.configService.get('db.mongo', {
      infer: true,
    });
  }

  /**
   * Retrieves the PostgreSQL database domain name based on the provided key.
   * @param {PgDomainNameTypes} key - The key to retrieve the domain name.
   * @returns {Promise<string>} The PostgreSQL database domain name.
   */
  protected async getValuePgDomainName(
    key: PgDomainNameTypes,
  ): Promise<string> {
    return this.configService.get(`db.pg.domain`, {
      infer: true,
    })[key];
  }

  /**
   * Retrieves the PostgreSQL database host based on the provided key.
   * @param {PgDatabaseUrlTypes} key - The key to retrieve the url.
   * @returns {Promise<string>} The PostgreSQL database url.
   */
  protected async getValuePgDatabaseUrl(
    key: PgDatabaseUrlTypes,
  ): Promise<string> {
    return this.configService.get(`db.pg.url`, {
      infer: true,
    })[key];
  }

  /**
   * Retrieves the PostgreSQL database host based on the provided key.
   * @param {PgHostTypes} key - The key to retrieve the host.
   * @returns {Promise<string>} The PostgreSQL database host.
   */
  protected async getValuePgHost(key: PgHostTypes): Promise<string> {
    return this.configService.get(`db.pg.host`, {
      infer: true,
    })[key];
  }

  /**
   * Retrieves the PostgreSQL database port based on the provided key.
   * It also validates that the retrieved value is a number.
   * @param {PgPortTypes} key - The key to retrieve the port.
   * @returns {Promise<number>} The PostgreSQL database port.
   * @throws {InternalServerErrorException} If the value is not a valid number.
   */
  protected async getValuePgPort(key: PgPortTypes): Promise<number> {
    const value = this.configService.get('db.pg.port', {
      infer: true,
    })[key];
    await this.validationNumbersType(value);
    return value;
  }

  /**
   * Retrieves the PostgreSQL database name based on the provided key.
   * @param {PgNamesDbTypes} key - The key to retrieve the database name.
   * @returns {Promise<string>} The PostgreSQL database name.
   */
  protected async getValuePgNameDb(key: PgNamesDbTypes): Promise<string> {
    return this.configService.get('db.pg.namesDatabase', {
      infer: true,
    })[key];
  }

  /**
   * Retrieves the PostgreSQL database authentication configuration based on the provided key.
   * @param {PgAuthTypes} key - The key to retrieve the authentication configuration.
   * @returns {Promise<string>} The PostgreSQL database authentication configuration.
   */
  protected async getValuePgAuth(key: PgAuthTypes): Promise<string> {
    return this.configService.get('db.pg.authConfig', {
      infer: true,
    })[key];
  }

  /**
   * Retrieves a specific key from the 'jwt' configuration property and returns its value as a string.
   * If the value is not found or empty, it either returns the provided `defaultValue` or throws an `InternalServerErrorException`.
   * @param {JwtConfigType} key - The key of the 'jwt' configuration property to retrieve.
   * @param {string} defaultValue - An optional default value to return if the key is not found or empty.
   * @returns {string} The value of the specified key from the 'jwt' configuration property.
   * @throws {InternalServerErrorException} If the value is not found or empty and no `defaultValue` is provided.
   */
  protected getValueString(key: JwtConfigType, defaultValue?: string): string {
    const value = this.configService.get('jwt', {
      infer: true,
    })[key];
    if (value.length === 0 || !value) {
      if (defaultValue) {
        return defaultValue;
      } else {
        throw new InternalServerErrorException({
          message: `incorrect configuration , cannot be found ${key}`,
        });
      }
    }
    return value;
  }

  /**
   * Retrieves the 'SALT_FACTOR' from the 'bcrypt' configuration property and uses it to generate a salt for hashing the provided `password`.
   * @param {string} password - The password to be hashed.
   * @returns {Promise<string>} A Promise containing the hashed password.
   */
  protected async getValueHash(password: string): Promise<string> {
    const SALT_FACTOR = this.configService.get('bcrypt', {
      infer: true,
    }).SALT_FACTOR;
    const salt = await bcrypt.genSalt(SALT_FACTOR);
    return bcrypt.hash(password, salt);
  }

  /**
   * Retrieves the 'SALT_FACTOR' from the 'bcrypt' configuration property and uses it to generate a salt for hashing the provided `password`.
   * @returns {Promise<string>} A Promise containing the hashed password.
   */
  protected async getSaValueHash(): Promise<string> {
    const basicAuth = this.configService.get('basicAuth', {
      infer: true,
    }).BASIC_AUTH;
    console.log(basicAuth, 'basicAuth');
    const decodedPassword = Buffer.from(basicAuth, 'base64')
      .toString('utf8')
      .split(':')[1];
    const SALT_FACTOR = this.configService.get('bcrypt', {
      infer: true,
    }).SALT_FACTOR;
    const salt = await bcrypt.genSalt(SALT_FACTOR);

    return bcrypt.hash(decodedPassword, salt);
  }

  /**
   * Retrieves a specific key from the 'mail' configuration property and returns its value as a Promise of a string.
   * @param {MailerTypes} key - The key of the 'mail' configuration property to retrieve.
   * @returns {Promise<string>} The value of the specified key from the 'mail' configuration property.
   */
  protected async getValueMailer(key: MailerTypes): Promise<string> {
    return this.configService.get(`mail`, {
      infer: true,
    })[key];
  }

  /**
   * Retrieves a specific key from the 'mail' configuration property and returns its value as a Promise of a number.
   * It also checks whether the value is a valid number by calling the `validationNumbersType` method.
   * @param {MailerPortTypes} key - The key of the 'mail' configuration property to retrieve.
   * @returns {Promise<number>} The value of the specified key from the 'mail' configuration property as a number.
   * @throws {InternalServerErrorException} If the value is not a valid number.
   */
  protected async getValueMailerPort(key: MailerPortTypes): Promise<number> {
    const value = this.configService.get('mail', {
      infer: true,
    })[key];
    await this.validationNumbersType(value);
    return value;
  }

  /**
   * Retrieves a specific key from the 'throttle' configuration property and returns its value.
   * It also checks whether the value is a valid number by calling the `validationNumbersType` method.
   * @param {ThrottleTypes} key - The key of the 'throttle' configuration property to retrieve.
   * @returns {Promise<any>} The value of the specified key from the 'throttle' configuration property.
   * @throws {InternalServerErrorException} If the value is not a valid number.
   */
  protected async getValueThrottle(key: ThrottleTypes): Promise<number> {
    const value = this.configService.get('throttle', {
      infer: true,
    })[key];
    await this.validationNumbersType(value);
    return value;
  }

  /**
   * Utility method used internally to validate whether the given `value` can be converted to a number.
   * @param {any} value - The value to be validated.
   * @returns {any} The original value if it can be converted to a number.
   * @throws {InternalServerErrorException} If the value cannot be converted to a number.
   */
  protected async validationNumbersType(value: any): Promise<number> {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new InternalServerErrorException({
        message: `incorrect configuration , cannot be found ${value}. Or isNaN(parsedValue)`,
      });
    }
    return value;
  }
}
