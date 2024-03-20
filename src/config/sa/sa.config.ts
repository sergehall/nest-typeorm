import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { SaKeysType } from './types/sa-keys.type';

@Injectable()
export class SaConfig extends BaseConfig {
  private config: Record<string, string> = {
    SA_KEY: 'SA_KEY',
    SA_PASSWORD_HASH: 'SA_PASSWORD_HASH',
    SA_EMAIL: 'SA_EMAIL',
    SA_LOGIN: 'SA_LOGIN',
    BASIC_AUTH: 'BASIC_AUTH',
  };

  private async getSaValueByKey(key: SaKeysType): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getValueSa(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in PayPal configuration`,
      );
    }
  }

  async getSaValue(key: SaKeysType): Promise<string> {
    return this.getSaValueByKey(key);
  }

  async getSaHash(): Promise<string> {
    return this.getValueSaHash();
  }
}
