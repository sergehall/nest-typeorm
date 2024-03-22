import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeAdapter } from '../../adapter/stripe-adapter';
import Stripe from 'stripe';
import { StripeConfig } from '../../../../../config/stripe/stripe.config';

export class ConstructStripeEventCommand {
  constructor(public rawBodyRequest: RawBodyRequest<Request>) {}
}

@CommandHandler(ConstructStripeEventCommand)
export class ConstructStripeEventUseCase
  implements ICommandHandler<ConstructStripeEventCommand>
{
  constructor(
    private readonly stripeConfig: StripeConfig,
    private readonly stripeAdapter: StripeAdapter,
  ) {}

  async execute(
    command: ConstructStripeEventCommand,
  ): Promise<Stripe.Event | undefined> {
    const { rawBodyRequest } = command;

    try {
      const stripeWebhookSecret =
        await this.stripeConfig.getStripeWebhookSecret('STRIPE_WEBHOOK_SECRET');

      if (
        rawBodyRequest.headers['stripe-signature'] &&
        rawBodyRequest.rawBody &&
        stripeWebhookSecret
      ) {
        const signature = rawBodyRequest.headers['stripe-signature'];

        const stripeInstance: Stripe =
          await this.stripeAdapter.createStripeInstance();

        return stripeInstance.webhooks.constructEvent(
          rawBodyRequest.rawBody,
          signature,
          stripeWebhookSecret,
        );
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error constructStripeEvent' + error.message,
      );
    }
  }
  stripeWebhookSecret = {
    id: 'WH-0TN7312112936943B-78S43056F43707901',
    event_version: '1.0',
    create_time: '2024-03-22T10:28:44.407Z',
    resource_type: 'checkout-order',
    resource_version: '2.0',
    event_type: 'CHECKOUT.ORDER.APPROVED',
    summary: 'An order has been approved by buyer',
    resource: {
      create_time: '2024-03-22T10:28:26Z',
      purchase_units: [
        {
          reference_id: '537d2f17-6fda-44a7-b6a9-8f385ef21c35',
          amount: {
            currency_code: 'USD',
            value: '17241.00',
            breakdown: {
              item_total: { currency_code: 'USD', value: '17241.00' },
            },
          },
          payee: {
            email_address: 'sb-je343k30060193@business.example.com',
            merchant_id: 'UFUM8UTKVA83A',
            display_data: { brand_name: 'IT-INCUBATOR INC' },
          },
          items: [
            {
              name: 'Mouse',
              unit_amount: { currency_code: 'USD', value: '706.42' },
              quantity: '4',
              description: 'Bluetooth-enabled',
            },
            {
              name: 'Earbuds',
              unit_amount: { currency_code: 'USD', value: '847.96' },
              quantity: '8',
              description: 'Durable',
            },
            {
              name: 'Earbuds',
              unit_amount: { currency_code: 'USD', value: '847.96' },
              quantity: '9',
              description: 'Durable',
            },
          ],
          shipping: {
            name: { full_name: 'СustomerFirstName CustomerLastName' },
            address: {
              address_line_1: 'Hollywood 123',
              address_line_2: 'apt. 17',
              admin_area_2: 'Los Angeles',
              admin_area_1: 'CA',
              postal_code: '95131',
              country_code: 'US',
            },
          },
        },
      ],
      links: [
        {
          href: 'https://api.sandbox.paypal.com/v2/checkout/orders/4D619475HL937153T',
          rel: 'self',
          method: 'GET',
        },
        {
          href: 'https://api.sandbox.paypal.com/v2/checkout/orders/4D619475HL937153T',
          rel: 'update',
          method: 'PATCH',
        },
        {
          href: 'https://api.sandbox.paypal.com/v2/checkout/orders/4D619475HL937153T/capture',
          rel: 'capture',
          method: 'POST',
        },
      ],
      id: '4D619475HL937153T',
      payment_source: {
        paypal: {
          email_address: 'sb-csn6h30100011@business.example.com',
          account_id: 'KWR4827EPGT8E',
          account_status: 'VERIFIED',
          name: {
            given_name: 'СustomerFirstName',
            surname: 'CustomerLastName',
          },
          address: { country_code: 'US' },
        },
      },
      intent: 'CAPTURE',
      payer: {
        name: { given_name: 'CustomerFirstName', surname: 'CustomerLastName' },
        email_address: 'sb-csn6h30100011@business.example.com',
        payer_id: 'KWR4827EPGT8E',
        address: { country_code: 'US' },
      },
      status: 'APPROVED',
    },
    links: [
      {
        href: 'https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-0TN7312112936943B-78S43056F43707901',
        rel: 'self',
        method: 'GET',
      },
      {
        href: 'https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-0TN7312112936943B-78S43056F43707901/resend',
        rel: 'resend',
        method: 'POST',
      },
    ],
  };
}
