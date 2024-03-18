import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentStripeDto } from '../dto/payment-stripe.dto';
import { StripeFactory } from '../../../../config/stripe/stripe-factory';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { UsersEntity } from '../../../../features/users/entities/users.entity';
import { GuestUsersEntity } from '../../../../common/products/entities/unregistered-users.entity';
import { CurrentUserDto } from '../../../../features/users/dto/current-user.dto';
import { GuestUsersDto } from '../../../../features/users/dto/guest-users.dto';

@Injectable()
export class StripeAdapter {
  constructor(
    private readonly stripeFactory: StripeFactory,
    private readonly postgresConfig: PostgresConfig,
  ) {}

  async createCheckoutSession(
    paymentStripeDto: PaymentStripeDto[],
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    // Create Stripe instance and retrieve URLs
    const [stripeInstance, successUrl, cancelUrl] = await Promise.all([
      this.createStripeInstance(),
      this.getStripeUrls('success'),
      this.getStripeUrls('cancel'),
    ]);

    const currentClient = paymentStripeDto[0].client;
    const client_reference_id =
      currentClient instanceof CurrentUserDto
        ? currentClient.userId
        : currentClient.guestUserId;

    // Prepare line items for checkout session
    const lineItems = paymentStripeDto.map((product: PaymentStripeDto) => {
      return {
        price_data: {
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: Number(product.unit_amount) * 100, // Assuming the price is in USD cents
          currency: product.currency,
        },
        quantity: product.quantity,
      };
    });

    // Create checkout session
    return await stripeInstance.checkout.sessions.create({
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: lineItems,
      mode: 'payment',
      client_reference_id: client_reference_id,
    });
  }

  async getStripeUrls(key: 'success' | 'cancel'): Promise<string> {
    const baseUrl = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const urlMap: { [key in 'success' | 'cancel']: string } = {
      success: '/stripe/success',
      cancel: '/stripe/cancel',
    };
    return `${baseUrl}${urlMap[key]}`;
  }

  async createStripeInstance(): Promise<Stripe> {
    return this.stripeFactory.createStripeInstance();
  }
}
