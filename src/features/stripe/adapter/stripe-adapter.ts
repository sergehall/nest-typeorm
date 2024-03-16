import { Injectable } from '@nestjs/common';
import { StripeFactory } from '../../../config/stripe/stripe-factory';
import { StripeUrlsKeyType } from '../types/stripe-urls-key.type';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import Stripe from 'stripe';
import { BuyRequestDto } from '../../blogs/dto/buy-request.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { Currency } from '../../../common/payment/enums/currency.enums';

@Injectable()
export class StripeAdapter {
  constructor(
    private readonly stripeFactory: StripeFactory,
    private readonly postgresConfig: PostgresConfig,
  ) {}

  async createCheckoutSession(
    buyRequest: BuyRequestDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const clientReferenceId: string =
      currentUserDto?.userId || 'test-clientReferenceId';

    const stripeInstance = await this.stripeFactory.createStripeInstance();
    const successUrl = await this.getStripeUrls('success');
    const cancelUrl = await this.getStripeUrls('cancel');

    const currency = Currency.USD;
    const mode = 'payment';

    return await stripeInstance.checkout.sessions.create({
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: buyRequest.products.map((product: any) => ({
        price_data: {
          product_data: {
            name: 'Product: ' + product.productId,
            description: 'Product description',
          },
          unit_amount: 10 * 100, // Assuming the price is in USD cents
          currency: currency,
        },
        quantity: product.quantity,
      })),
      mode: mode,
      client_reference_id: clientReferenceId,
    });
  }

  async getStripeUrls(key: StripeUrlsKeyType): Promise<string> {
    const baseUrl = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const urlMap: { [key in StripeUrlsKeyType]: string } = {
      success: '/stripe/success',
      cancel: '/stripe/cancel',
    };
    return `${baseUrl}${urlMap[key]}`;
  }

  async createStripeInstance(): Promise<Stripe> {
    return this.stripeFactory.createStripeInstance();
  }
}
