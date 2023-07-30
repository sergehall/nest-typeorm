import { ConfigType } from '../configuration';
import { JwtConfigType } from '../jwt/jwt-config.types';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ThrottleTypes } from '../throttle/types/throttle.types';
import { MailerPortTypes, MailerTypes } from '../mailer/types/mailer.types';

@Injectable()
export class BaseConfig {
  constructor(protected configService: ConfigService<ConfigType, true>) {}

  protected getValueENV() {
    return this.configService.get('ENV', {
      infer: true,
    });
  }

  protected getValueDatabase() {
    return this.configService.get('db', {
      infer: true,
    });
  }

  protected getValueString(key: JwtConfigType, defaultValue?: string) {
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

  protected getValueThrottle(key: ThrottleTypes): number {
    return this.configService.get('throttle', {
      infer: true,
    })[key];
  }

  protected getValueMailer(key: MailerTypes): string {
    return this.configService.get(`mail`, {
      infer: true,
    })[key];
  }

  protected getValueMailerPort(key: MailerPortTypes): number {
    return this.configService.get(`mail`, {
      infer: true,
    })[key];
  }

  protected getValueNumber(key: ThrottleTypes, defaultValue?: number) {
    const value = this.configService.get('throttle', {
      infer: true,
    })[key];
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      if (defaultValue !== undefined) {
        return defaultValue;
      } else {
        throw new InternalServerErrorException({
          message: `incorrect configuration , cannot be found ${key}`,
        });
      }
    }
    return value;
  }
}
