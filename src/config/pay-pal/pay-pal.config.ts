import { BaseConfig } from '../base/base.config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PayPalKeysType } from './types/pay-pal-keys.type';

@Injectable()
export class PayPalConfig extends BaseConfig {
  private config: Record<string, string> = {
    PAYPAL_WEBHOOK_ID: 'PAYPAL_WEBHOOK_ID',
    PAYPAL_CLIENT_ID: 'PAYPAL_CLIENT_ID',
    PAYPAL_CLIENT_SECRET: 'PAYPAL_CLIENT_SECRET',
  };

  async getPayPalValueByKey(key: PayPalKeysType): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getValuePayPal(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in PayPal configuration`,
      );
    }
  }
  async getPayPalValue(key: PayPalKeysType): Promise<string> {
    return this.getPayPalValueByKey(key);
  }
}
