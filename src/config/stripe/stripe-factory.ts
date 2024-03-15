import { Injectable } from '@nestjs/common';
import { StripeConfigDto } from './dto/stripe-config.dto';
import Stripe from 'stripe';
import { StripeConfig } from './stripe.config';

@Injectable()
export class StripeFactory extends StripeConfig {
  async createStripeInstance(type: 'test' | 'live'): Promise<Stripe> {
    const apiKeyDto: StripeConfigDto =
      type === 'test' ? await this.getTestApiKey() : await this.getLiveApiKey();
    return new Stripe(apiKeyDto.apiKey);
  }

  async getTestApiKey(): Promise<StripeConfigDto> {
    const stripeTestApiKey = await this.getTestStripeApiKey(
      'GET_TEST_STRIPE_API_KEY',
    );
    return {
      apiKey: stripeTestApiKey,
    };
  }

  async getLiveApiKey(): Promise<StripeConfigDto> {
    const stripeTestApiKey = await this.getTestStripeApiKey(
      'GET_TEST_STRIPE_API_KEY',
    );
    return {
      apiKey: stripeTestApiKey,
    };
  }
}
