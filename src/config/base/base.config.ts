import { ConfigType } from '../configuration';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottleTypes } from '../throttle/types/throttle.types';
import * as bcrypt from 'bcrypt';
import { EnvNamesEnums } from '../enums/env-names.enums';
import { PayPalKeysType } from '../pay-pal/types/pay-pal-keys.type';
import { TelegramKeysType } from '../telegram/types/telegram-keys.type';
import { StripeKeysType } from '../stripe/types/stripe-keys.type';
import { SaKeysType } from '../sa/types/sa-keys.type';
import { PgKeysType } from '../db/postgres/types/pg-keys.type';
import { JwtKeysType } from '../jwt/types/jwt-keys.types';
import { PgPortKeyType } from '../db/postgres/types/pg-port-key.type';
import { MongoDbKeysType } from '../db/mongo/types/mongo-db-keys.type';
import { AwsKeysTypes } from '../aws/types/aws-keys.types';
import { MailsKeysTypes, MailsPortKeyType } from '../mails/types/mails.types';
import { ReCaptchaKeyType } from '../recaptcha/types/re-captcha-key.type';

@Injectable()
export class BaseConfig {
  constructor(protected configService: ConfigService<ConfigType, true>) {}
  /**
   * Retrieves the value of the 'ENV' environment variable and returns it as a Promise of `EnvNamesEnums`.
   * @returns {Promise<EnvNamesEnums>} The value of the 'ENV' environment variable.
   */
  async getValueENV(): Promise<EnvNamesEnums> {
    return this.configService.get('ENV', {
      infer: true,
    });
  }

  /**
   * Retrieves a specific AWS value by key from the configuration.
   * @param {AwsKeysTypes} key - The key to retrieve the value for.
   * @returns {Promise<string>} The value associated with the provided key.
   */
  protected async getValueAwsByKey(key: AwsKeysTypes): Promise<string> {
    return this.configService.get('db.aws', {
      infer: true,
    })[key];
  }

  protected async getValuePayPal(key: PayPalKeysType): Promise<string> {
    return this.configService.get('paypal', {
      infer: true,
    })[key];
  }

  protected async getValueReCaptcha(key: ReCaptchaKeyType): Promise<string> {
    return this.configService.get('reCaptcha', {
      infer: true,
    })[key];
  }

  protected async getValueTelegram(key: TelegramKeysType): Promise<string> {
    return this.configService.get('telegram', {
      infer: true,
    })[key];
  }

  protected async getValueSa(key: SaKeysType): Promise<string> {
    return this.configService.get('sa', {
      infer: true,
    })[key];
  }

  protected async getValueStripe(key: StripeKeysType): Promise<string> {
    return this.configService.get('stripe', {
      infer: true,
    })[key];
  }

  protected async getValueMongoByKey(key: MongoDbKeysType): Promise<string> {
    return this.configService.get('db.mongo', {
      infer: true,
    })[key];
  }

  protected async getValuePostgresByKey(key: PgKeysType): Promise<string> {
    return this.configService.get(`db.postgres`, {
      infer: true,
    })[key];
  }

  protected async getValuePgPort(key: PgPortKeyType): Promise<number> {
    const value = this.configService.get('db.postgres', {
      infer: true,
    })[key];
    await this.validationNumbersType(value);
    return value;
  }

  protected getValueJwtByKey(key: JwtKeysType): string {
    return this.configService.get('jwt', {
      infer: true,
    })[key];
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
  protected async getValueSaHash(): Promise<string> {
    const basicAuth = this.configService.get('sa', {
      infer: true,
    }).BASIC_AUTH;

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
   * @param {MailsKeysTypes} key - The key of the 'mail' configuration property to retrieve.
   * @returns {Promise<string>} The value of the specified key from the 'mail' configuration property.
   */
  protected async getValueMailer(key: MailsKeysTypes): Promise<string> {
    return this.configService.get(`mail`, {
      infer: true,
    })[key];
  }

  /**
   * Retrieves a specific key from the 'mail' configuration property and returns its value as a Promise of a number.
   * It also checks whether the value is a valid number by calling the `validationNumbersType` method.
   * @param {MailsPortKeyType} key - The key of the 'mail' configuration property to retrieve.
   * @returns {Promise<number>} The value of the specified key from the 'mail' configuration property as a number.
   * @throws {InternalServerErrorException} If the value is not a valid number.
   */
  protected async getValueMailsPort(key: MailsPortKeyType): Promise<number> {
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
