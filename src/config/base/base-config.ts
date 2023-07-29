import { ConfigType } from '../configuration';
import { JwtConfigType } from '../jwt/jwt-config.types';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ThrottleConfigTypes } from '../throttle/throttle-config.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BaseConfig {
  constructor(protected configService: ConfigService<ConfigType, true>) {}
  protected getValueString(key: JwtConfigType, defaultValue?: string) {
    const value = this.configService.get('jwtConfig', {
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
  protected getValueNumber(key: ThrottleConfigTypes, defaultValue?: number) {
    const value = this.configService.get('throttleConfig', {
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
