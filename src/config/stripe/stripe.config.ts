import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { StripeKeysType } from './types/stripe-keys.type';
import { SpireVersionDefaultEnum } from './enums/spire-version-default.enum';

@Injectable()
export class StripeConfig extends BaseConfig {
  private config: Record<string, string> = {
    STRIPE_TEST_API_KEY: 'STRIPE_TEST_API_KEY',
    STRIPE_LIVE_API_KEY: 'STRIPE_LIVE_API_KEY',
    STRIPE_API_VERSION: 'STRIPE_API_VERSION',
    STRIPE_WEBHOOK_SECRET: 'STRIPE_WEBHOOK_SECRET',
  };

  async getStripeValueByKey(key: StripeKeysType): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getValueStripe(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in Stripe configuration`,
      );
    }
  }

  async getStripeApiKey(key: StripeKeysType): Promise<string> {
    return await this.getStripeValueByKey(key);
  }

  async getStripeWebhookSecret(key: StripeKeysType): Promise<string> {
    return this.getStripeValueByKey(key);
  }

  async getStripeVersion(
    key: StripeKeysType,
  ): Promise<SpireVersionDefaultEnum.default> {
    // Get the version from the configuration or database
    const version = await this.getStripeValueByKey(key);

    // If the version is not defined or does not match the expected type, return the default version
    if (version !== SpireVersionDefaultEnum.default) {
      return SpireVersionDefaultEnum.default;
    }

    // Otherwise, return the retrieved version
    return version;
  }
}
