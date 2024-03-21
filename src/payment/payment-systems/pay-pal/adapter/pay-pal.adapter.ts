import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PayPalGenerateAccessTokenCommand } from '../application/use-cases/pay-pal-generate-access-token.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { PayPalUrlsEnum } from '../enums/pay-pal-urls.enum';
import axios from 'axios';
import { PaymentDto } from '../../../dto/payment.dto';
import { CurrentUserDto } from '../../../../features/users/dto/current-user.dto';
import { IntentsEnums } from '../../../enums/intents.enums';

@Injectable()
export class PayPalAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  async createCheckoutOrder(paymentStripeDto: PaymentDto[]) {
    try {
      const accessToken = await this.generateAccessToken();

      console.log(accessToken, 'accessToken');

      const baseUrl = PayPalUrlsEnum.BaseApi;
      const url = baseUrl + '/v2/checkout/orders';

      const currentClient = paymentStripeDto[0].client;
      const orderId = paymentStripeDto[0].orderId;
      let payPalRequestId: string =
        currentClient instanceof CurrentUserDto
          ? currentClient.userId
          : currentClient.guestUserId;

      payPalRequestId += `.${orderId}`;

      // // Prepare line items for checkout
      // const lineItems = paymentStripeDto.map((product: PaymentDto) => {
      //   return {
      //     amount: {
      //       currency_code: product.currency,
      //       value: product.unitAmount,
      //     },
      //     name: product.name,
      //     description: product.description,
      //     quantity: product.quantity,
      //   };
      // });

      // Prepare line items for checkout
      const lineItems = paymentStripeDto.map((product: PaymentDto) => {
        return {
          reference_id: payPalRequestId,
          amount: {
            currency_code: product.currency,
            value: product.unitAmount,
          },
        };
      });

      const body = JSON.stringify({
        intent: IntentsEnums.CAPTURE,
        purchase_units: lineItems,
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
      });
      console.log(body, 'body');
      const response = await axios.post(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'PayPal-Request-Id': payPalRequestId,
        },
        body: body,
      });

      console.log(response, 'response');

      return response.data;
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
}
