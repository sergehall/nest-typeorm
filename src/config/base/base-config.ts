import { ConfigType } from '../configuration';
import { JwtConfigType } from '../jwt/types/jwt-config.types';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottleTypes } from '../throttle/types/throttle.types';
import { MailerPortTypes, MailerTypes } from '../mailer/types/mailer.types';
import * as bcrypt from 'bcrypt';
import { DbConfigTypes } from '../db/types/db.types';
import { EnvNamesEnums } from '../env-names.enums/envNames.enums';

@Injectable()
export class BaseConfig {
  constructor(protected configService: ConfigService<ConfigType, true>) {}

  protected async getValueENV(): Promise<EnvNamesEnums> {
    return this.configService.get('ENV', {
      infer: true,
    });
  }

  protected async getValueDatabase(): Promise<DbConfigTypes> {
    return this.configService.get('db', {
      infer: true,
    });
  }

  protected async getValueString(key: JwtConfigType, defaultValue?: string) {
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

  protected async getValueHash(password: string): Promise<string> {
    const SALT_FACTOR = this.configService.get('bcrypt', {
      infer: true,
    }).SALT_FACTOR;
    const salt = await bcrypt.genSalt(SALT_FACTOR);
    return bcrypt.hash(password, salt);
  }

  protected async getValueMailer(key: MailerTypes): Promise<string> {
    return this.configService.get(`mail`, {
      infer: true,
    })[key];
  }

  protected async getValueMailerPort(key: MailerPortTypes): Promise<number> {
    const value = this.configService.get('mail', {
      infer: true,
    })[key];
    this.validationNumbersType(value);
    return value;
  }

  protected async getValueThrottle(key: ThrottleTypes) {
    const value = this.configService.get('throttle', {
      infer: true,
    })[key];
    this.validationNumbersType(value);
    return value;
  }

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
