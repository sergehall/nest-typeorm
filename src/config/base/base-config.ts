import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../configuration';
import { JwtConfigType } from '../jwt/jwt-config.types';
import { InternalServerErrorException } from '@nestjs/common';
import { ThrottleConfigTypes } from '../throttle/throttle-config.types';
import { DbConfigTypes } from '../db/db-config.types';

export class BaseConfig {
  constructor(protected configService: ConfigService<ConfigType, true>) {}
  protected getValueString(key: JwtConfigType, defaultValue?: string) {
    const value = this.configService.get(key, {
      infer: true,
    });
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
  protected getValueNumber(key: ThrottleConfigTypes, defaultValue?: number) {
    const value = this.configService.get(key, {
      infer: true,
    });
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
  protected getValueUri(key: DbConfigTypes, defaultValue?: string) {
    const expression =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const regex = new RegExp(expression);
    const value = this.configService.get(key, {
      infer: true,
    });
    if (!value) {
      if (!value.match(regex) || defaultValue !== undefined) {
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
