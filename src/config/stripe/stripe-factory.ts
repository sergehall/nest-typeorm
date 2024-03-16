import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StripeConfigDto } from './dto/stripe-config.dto';
import Stripe from 'stripe';
import { StripeConfig } from './stripe.config';
import { SpireVersionDefaultEnum } from './types/spire-version.type';
import { EnvNamesEnums } from '../enums/env-names.enums';
import { NodeEnvConfig } from '../node-env/node-env.config';

@Injectable()
export class StripeFactory {
  constructor(
    private readonly nodeEnvConfig: NodeEnvConfig,
    private readonly stripeConfig: StripeConfig,
  ) {}

  async createStripeInstance(): Promise<Stripe> {
    const version: SpireVersionDefaultEnum =
      await this.stripeConfig.getStripeVersion('STRIPE_API_VERSION');
    const envNames: EnvNamesEnums = await this.nodeEnvConfig.getValueENV();

    let apiKeyDto: StripeConfigDto;

    switch (envNames) {
      case 'test':
      case 'development':
      case 'staging':
        apiKeyDto = await this.getTestApiKey();
        break;
      case 'production':
      case 'live':
        apiKeyDto = await this.getLiveApiKey();
        break;
      default:
        throw new InternalServerErrorException('Invalid API environment');
    }

    return new Stripe(apiKeyDto.apiKey, { apiVersion: version });
  }

  async getTestApiKey(): Promise<StripeConfigDto> {
    const stripeTestApiKey = await this.stripeConfig.getStripeApiKey(
      'STRIPE_TEST_API_KEY',
    );
    return {
      apiKey: stripeTestApiKey,
    };
  }

  async getLiveApiKey(): Promise<StripeConfigDto> {
    const stripeTestApiKey = await this.stripeConfig.getStripeApiKey(
      'STRIPE_LIVE_API_KEY',
    );
    return {
      apiKey: stripeTestApiKey,
    };
  }
}
