import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentDto } from '../../../dto/payment.dto';
import { ReferenceIdType } from '../../types/reference-id.type';
import { PaymentService } from '../../../application/payment.service';
import { StripeFactory } from '../factory/stripe-factory';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';

@Injectable()
export class StripeAdapter {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeFactory: StripeFactory,
    private readonly postgresConfig: PostgresConfig,
  ) {}

  async createCheckoutSession(
    paymentDto: PaymentDto[],
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    // Create Stripe instance and retrieve URLs
    const [stripeInstance, successUrl, cancelUrl] = await Promise.all([
      this.stripeFactory.createStripeInstance(),
      this.getStripeUrls('success'),
      this.getStripeUrls('cancel'),
    ]);

    const referenceIdDto: ReferenceIdType =
      await this.paymentService.generateReferenceId(paymentDto);
    const client_reference_id: string = referenceIdDto.referenceId;

    // Prepare line items for checkout session
    const lineItems = paymentDto.map((product: PaymentDto) => {
      return {
        price_data: {
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: Math.round(parseFloat(product.unitAmount) * 100), // Assuming the price is in USD cents
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
    const baseUrl =
      await this.postgresConfig.getPostgresConfig('PG_DOMAIN_HEROKU');
    const urlMap: { [key in 'success' | 'cancel']: string } = {
      success: '/stripe/success',
      cancel: '/stripe/cancel',
    };
    return `${baseUrl}${urlMap[key]}`;
  }
}
