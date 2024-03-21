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

      console.log(accessToken, 'accessToken');

      const baseUrl = PayPalUrlsEnum.BaseSandboxApi;
      const url = baseUrl + '/v2/checkout/orders';

      // const currentClient = paymentStripeDto[0].client;
      const orderId = paymentStripeDto[0].orderId;
      // let payPalRequestId: string =
      //   currentClient instanceof CurrentUserDto
      //     ? currentClient.userId
      //     : currentClient.guestUserId;
      //
      // payPalRequestId += `.${orderId}`;

      // Prepare line items for checkout
      const lineItems = paymentStripeDto.map((product: PaymentDto) => {
        return {
          items: [
            {
              name: product.name,
              description: product.description,
              quantity: String(product.quantity),
              unit_amount: {
                currency_code: product.currency,
                value: product.unitAmount,
              },
            },
          ],
          amount: {
            currency_code: product.currency,
            value: product.unitAmount,
            breakdown: {
              item_total: {
                currency_code: product.currency,
                value: product.unitAmount,
              },
            },
          },
        };
      });

      const body = JSON.stringify({
        intent: IntentsEnums.CAPTURE,
        purchase_units: lineItems,
        application_context: {
          return_url: 'https://example.com/return',
          cancel_url: 'https://example.com/cancel',
        },
      });
      // console.log(body, 'body');

      const response = await axios.post(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PayPal-Request-Id': orderId,
          Authorization: `Bearer ${accessToken}`,
        },
        body: body,
      });

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
}
