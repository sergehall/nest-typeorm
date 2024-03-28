import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalFactory } from '../../../../../config/pay-pal/pay-pal-factory';

export class PayPalGenerateAccessTokenCommand {
  constructor() {}
}

@CommandHandler(PayPalGenerateAccessTokenCommand)
export class PayPalGenerateAccessTokenUseCase
  implements ICommandHandler<PayPalGenerateAccessTokenCommand>
{
  constructor(private readonly payPalFactory: PayPalFactory) {}

  async execute(): Promise<string> {
    try {
      // const baseUrl = await this.payPalFactory.getPayPalUrlsDependentEnv();
      // const url = baseUrl + '/v1/oauth2/token';
      const url = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
      const { username, password } =
        await this.payPalFactory.getUsernamePassword();

      // const response = await axios({
      //   url: url,
      //   method: 'POST',
      //   data: 'grant_type=client_credentials',
      //   auth: {
      //     username: username,
      //     password: password,
      //   },
      //   headers: {
      //     Accept: 'application/json',
      //     'Accept-Language': 'en_US',
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //   },
      // });

      const data = 'grant_type=client_credentials';
      const config = {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'en_US',
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios.post(url, data, config);

      return response.data.access_token;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'Failed to generate access token',
        error.message,
      );
    }
  }
  newRRR = {
    id: 'cs_test_a11q5LYp6LwIJYP0O6d8vi28xdhxR4JVLJLxG78AO0h7jZ4QWGJtqShjLS',
    object: 'checkout.session',
    after_expiration: null,
    allow_promotion_codes: null,
    amount_subtotal: 10635,
    amount_total: 10635,
    automatic_tax: { enabled: false, liability: null, status: null },
    billing_address_collection: null,
    cancel_url:
      'https://nest-typeorm-heroku-fc82366654b2.herokuapp.com/stripe/cancel',
    client_reference_id:
      'c8d067aa-ea30-42e2-813a-d7a5b68638a7.db251af2-1751-45d5-b079-a0f67659e292',
    client_secret: null,
    consent: null,
    consent_collection: null,
    created: 1711313835,
    currency: 'usd',
    currency_conversion: null,
    custom_fields: [],
    custom_text: {
      after_submit: null,
      shipping_address: null,
      submit: null,
      terms_of_service_acceptance: null,
    },
    customer: null,
    customer_creation: 'if_required',
    customer_details: {
      address: {
        city: null,
        country: 'US',
        line1: null,
        line2: null,
        postal_code: '54645',
        state: null,
      },
      email: 'serge.hall.dev@gmail.com',
      name: 'Serge Hall',
      phone: null,
      tax_exempt: 'none',
      tax_ids: [],
    },
    customer_email: null,
    expires_at: 1711400235,
    invoice: null,
    invoice_creation: {
      enabled: false,
      invoice_data: {
        account_tax_ids: null,
        custom_fields: null,
        description: null,
        footer: null,
        issuer: null,
        metadata: {},
        rendering_options: null,
      },
    },
    livemode: false,
    locale: null,
    metadata: {},
    mode: 'payment',
    payment_intent: 'pi_3Oxy6eBCX0DjbSyL1JYzokcX',
    payment_link: null,
    payment_method_collection: 'if_required',
    payment_method_configuration_details: null,
    payment_method_options: { card: { request_three_d_secure: 'automatic' } },
    payment_method_types: ['card'],
    payment_status: 'paid',
    phone_number_collection: { enabled: false },
    recovered_from: null,
    setup_intent: null,
    shipping_address_collection: null,
    shipping_cost: null,
    shipping_details: null,
    shipping_options: [],
    status: 'complete',
    submit_type: null,
    subscription: null,
    success_url:
      'https://nest-typeorm-heroku-fc82366654b2.herokuapp.com/stripe/success',
    total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
    ui_mode: 'hosted',
    url: null,
  };
}
