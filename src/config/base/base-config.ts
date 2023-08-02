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

  /**
   * Retrieves the value of the 'db' configuration property and returns it as a Promise of `DatabaseConfigTypes`.
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
    this.validationNumbersType(value);
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
    this.validationNumbersType(value);
    return value;
  }

  /**
   * Retrieves a specific key from the 'throttle' configuration property and returns its value.
   * It also checks whether the value is a valid number by calling the `validationNumbersType` method.
   * @param {ThrottleTypes} key - The key of the 'throttle' configuration property to retrieve.
   * @returns {Promise<any>} The value of the specified key from the 'throttle' configuration property.
   * @throws {InternalServerErrorException} If the value is not a valid number.
   */
  protected async getValueThrottle(key: ThrottleTypes) {
    const value = this.configService.get('throttle', {
      infer: true,
    })[key];
    this.validationNumbersType(value);
    return value;
  }

  /**
   * Utility method used internally to validate whether the given `value` can be converted to a number.
   * @param {any} value - The value to be validated.
   * @returns {any} The original value if it can be converted to a number.
   * @throws {InternalServerErrorException} If the value cannot be converted to a number.
   */
  protected validationNumbersType(value: any) {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new InternalServerErrorException({
        message: `incorrect configuration , cannot be found ${value}`,
      });
    }
    return value;
  }
}
