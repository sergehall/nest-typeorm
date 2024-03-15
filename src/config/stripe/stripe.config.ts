import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { ApiNameKeyType } from './types/api-name-key.type';

@Injectable()
export class StripeConfig extends BaseConfig {
  async getTestStripeApiKey(stripeTestApiKey: ApiNameKeyType): Promise<string> {
    return await this.getValueTestStripeApiKey(stripeTestApiKey);
  }
}
