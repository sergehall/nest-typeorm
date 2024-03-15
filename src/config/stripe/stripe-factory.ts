import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StripeConfigDto } from './dto/stripe-config.dto';
import Stripe from 'stripe';
import { SpireApiKeysType } from './types/spire-api-keys.type';
import { StripeConfig } from './stripe.config';
import { SpireVersionDefaultEnum } from './types/spire-version.type';

@Injectable()
export class StripeFactory extends StripeConfig {
  async createStripeInstance(type: SpireApiKeysType): Promise<Stripe> {
    const version: SpireVersionDefaultEnum.default =
      await this.getStripeVersion('STRIPE_API_VERSION');

    switch (type) {
      case 'test':
        const testApiKeyDto: StripeConfigDto = await this.getTestApiKey();
        return new Stripe(testApiKeyDto.apiKey, { apiVersion: version });
      case 'live':
        const liveApiKeyDto: StripeConfigDto = await this.getLiveApiKey();
        return new Stripe(liveApiKeyDto.apiKey, { apiVersion: version });
      default:
        throw new InternalServerErrorException('Invalid API name key');
    }
  }

  async getTestApiKey(): Promise<StripeConfigDto> {
    const stripeTestApiKey = await this.getStripeApiKey('STRIPE_TEST_API_KEY');
    return {
      apiKey: stripeTestApiKey,
    };
  }

  async getLiveApiKey(): Promise<StripeConfigDto> {
    const stripeTestApiKey = await this.getStripeApiKey('STRIPE_LIVE_API_KEY');
    return {
      apiKey: stripeTestApiKey,
    };
  }
}
