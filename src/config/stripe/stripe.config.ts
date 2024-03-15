import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { ApiNameKeyType } from './types/api-name-key.type';
import {
  SpireVersionDefaultEnum,
  SpireVersionKey,
} from './types/spire-version.type';

@Injectable()
export class StripeConfig extends BaseConfig {
  async getStripeApiKey(stripeTestApiKey: ApiNameKeyType): Promise<string> {
    return await this.getValueStripeApiKey(stripeTestApiKey);
  }

  async getStripeVersion(
    stripeVersion: SpireVersionKey,
  ): Promise<SpireVersionDefaultEnum.default> {
    // Get the version from the configuration or database
    const version = await this.getValueStripeVersion(stripeVersion);

    // If the version is not defined or does not match the expected type, return the default version
    if (version !== SpireVersionDefaultEnum.default) {
      return SpireVersionDefaultEnum.default;
    }

    // Otherwise, return the retrieved version
    return version;
  }
}
