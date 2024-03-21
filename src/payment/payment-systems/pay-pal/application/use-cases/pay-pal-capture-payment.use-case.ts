import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayPalUrlsEnum } from '../../enums/pay-pal-urls.enum';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalAdapter } from '../../adapter/pay-pal.adapter';

export class PayPalCapturePaymentCommand {
  constructor() {}
}

@CommandHandler(PayPalCapturePaymentCommand)
export class PayPalCapturePaymentUseCase
  implements ICommandHandler<PayPalCapturePaymentCommand>
{
  constructor(private readonly payPalAdapter: PayPalAdapter) {}

  async execute(): Promise<string> {
    try {
      const accessToken = await this.payPalAdapter.generateAccessToken();
      const baseUrl = PayPalUrlsEnum.BaseSandboxApi;
      const url = baseUrl + '/v1/oauth2/token';

      const response = await axios({
        url: url,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      console.log(data, 'data PayPalCapturePayment');

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to PayPalCapturePayment',
        error.message,
      );
    }
  }
}
