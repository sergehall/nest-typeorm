import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PayPalGenerateAccessTokenCommand } from '../application/use-cases/pay-pal-generate-access-token.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { PayPalUrlsEnum } from '../enums/pay-pal-urls.enum';
import axios from 'axios';
import { PaymentDto } from '../../../dto/payment.dto';
import { IntentsEnums } from '../../../enums/intents.enums';

@Injectable()
export class PayPalAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  async createCheckoutOrder(paymentStripeDto: PaymentDto[]): Promise<any> {
    try {
      const accessToken = await this.generateAccessToken();

      // console.log(accessToken, 'accessToken');
      //
      // const baseUrl = PayPalUrlsEnum.BaseSandboxApi;
      // const url = baseUrl + '/v2/checkout/orders';
      //
      // // const currentClient = paymentStripeDto[0].client;
      // const orderId = paymentStripeDto[0].orderId;
      // // let payPalRequestId: string =
      // //   currentClient instanceof CurrentUserDto
      // //     ? currentClient.userId
      // //     : currentClient.guestUserId;
      // //
      // // payPalRequestId += `.${orderId}`;
      //
      // // // Prepare line items for checkout
      // // const lineItems = paymentStripeDto.map((product: PaymentDto) => {
      // //   return {
      // //     items: [
      // //       {
      // //         name: product.name,
      // //         description: product.description,
      // //         quantity: String(product.quantity),
      // //         unit_amount: {
      // //           currency_code: product.currency,
      // //           value: product.unitAmount,
      // //         },
      // //       },
      // //     ],
      // //     amount: {
      // //       currency_code: product.currency,
      // //       value: product.unitAmount,
      // //       breakdown: {
      // //         item_total: {
      // //           currency_code: product.currency,
      // //           value: product.unitAmount,
      // //         },
      // //       },
      // //     },
      // //   };
      // // });
      //
      // // Prepare line items for checkout
      // const lineItems = paymentStripeDto.map((product: PaymentDto) => {
      //   return {
      //     reference_id: orderId,
      //     amount: {
      //       currency_code: product.currency,
      //       value: product.unitAmount,
      //     },
      //   };
      // });
      //
      // const body = JSON.stringify({
      //   intent: IntentsEnums.CAPTURE,
      //   purchase_units: lineItems,
      //   application_context: {
      //     return_url: 'https://example.com/return',
      //     cancel_url: 'https://example.com/cancel',
      //   },
      // });
      // // console.log(body, 'body');
      //
      // const response = await axios.post(url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'PayPal-Request-Id': orderId,
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      //   body: body,
      //   payment_source: {
      //     paypal: {
      //       experience_context: {
      //         payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
      //         brand_name: 'EXAMPLE INC',
      //         locale: 'en-US',
      //         landing_page: 'LOGIN',
      //         shipping_preference: 'SET_PROVIDED_ADDRESS',
      //         user_action: 'PAY_NOW',
      //         return_url: 'https://example.com/returnUrl',
      //         cancel_url: 'https://example.com/cancelUrl',
      //       },
      //     },
      //   },
      // });

      const response = await this.makePayPalRequest(accessToken);

      console.log(response, 'response');

      return response;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'Failed to createCheckoutOrder' + error.message,
      );
    }
  }

  async generateAccessToken(): Promise<string> {
    return this.commandBus.execute(new PayPalGenerateAccessTokenCommand());
  }

  async makePayPalRequest(accessToken: string) {
    const data = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: 'd9f80740-38f0-11e8-b467-0ed5f89f718b',
          items: [
            {
              name: 'Earbuds',
              description: 'Durable',
              quantity: '2',
              unit_amount: {
                currency_code: 'USD',
                value: '100.00',
              },
            },
            {
              name: 'Earbuds1',
              description: 'Durable1',
              quantity: '1',
              unit_amount: {
                currency_code: 'USD',
                value: '100.00',
              },
            },
          ],
          amount: {
            currency_code: 'USD',
            value: '300.00',
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: '300.00',
              },
            },
          },
          shipping: {
            address: {
              address_line_1: '123 Shipping Street',
              address_line_2: 'Apt 1',
              admin_area_2: 'San Jose',
              admin_area_1: 'CA',
              postal_code: '95131',
              country_code: 'US',
            },
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            brand_name: 'EXAMPLE INC',
            locale: 'en-US',
            landing_page: 'LOGIN',
            shipping_preference: 'SET_PROVIDED_ADDRESS',
            user_action: 'PAY_NOW',
            return_url: 'https://example.com/returnUrl',
            cancel_url: 'https://example.com/cancelUrl',
          },
        },
      },
    };

    const options = {
      headers: {
        'Content-Type': 'application/json',
        'PayPal-Request-Id': '7b92603e-77ed-5896-8e78-5dea2050476a',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await axios.post(
        'https://api-m.sandbox.paypal.com/v2/checkout/orders',
        data,
        options,
      );
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response.data);
    }
  }
}
