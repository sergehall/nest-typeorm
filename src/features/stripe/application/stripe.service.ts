import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeFactory } from '../../../config/stripe/stripe-factory';
import { SpireApiKeysType } from '../../../config/stripe/types/spire-api-keys.type';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import { StripeUrlsKeyType } from '../types/stripe-urls-key.type';

@Injectable()
export class StripeService {
  constructor(
    private readonly stripeFactory: StripeFactory,
    private readonly postgresConfig: PostgresConfig,
  ) {}

  async createStripeInstance(type: SpireApiKeysType): Promise<Stripe> {
    return this.stripeFactory.createStripeInstance(type);
  }

  async getStripeUrls(key: StripeUrlsKeyType): Promise<string> {
    const baseUrl = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const urlMap: { [key in StripeUrlsKeyType]: string } = {
      success: '/stripe/success',
      cancel: '/stripe/cancel',
    };
    return `${baseUrl}${urlMap[key]}`;
  }

  async transferProduct(
    productId: string,
    quantity: number,
    userId: string,
  ): Promise<any> {
    // Simulate the transfer of a product to a user
    // Here, you can implement the logic to interact with Stripe or any other payment service

    // For demonstration purposes, let's just return a mock result
    return {
      success: true,
      productId,
      quantity,
      userId,
      message: `Product ${productId} transferred successfully to user ${userId}.`,
    };
  }
}
