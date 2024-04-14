import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { NodeEnvConfig } from '../../../../config/node-env/node-env.config';
import { StripeConfig } from '../../../../config/stripe/stripe.config';
import { SpireVersionDefaultEnum } from '../../../../config/stripe/enums/spire-version-default.enum';
import { EnvNamesEnums } from '../../../../config/enums/env-names.enums';
import { StripeConfigDto } from '../../../../config/stripe/dto/stripe-config.dto';

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
