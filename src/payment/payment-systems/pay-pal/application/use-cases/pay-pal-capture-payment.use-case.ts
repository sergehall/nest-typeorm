import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalAdapter } from '../../adapter/pay-pal.adapter';
import { PayPalFactory } from '../../../../../config/pay-pal/pay-pal-factory';

export class PayPalCapturePaymentCommand {
  constructor() {}
}

@CommandHandler(PayPalCapturePaymentCommand)
export class PayPalCapturePaymentUseCase
  implements ICommandHandler<PayPalCapturePaymentCommand>
{
  constructor(
    private readonly payPalAdapter: PayPalAdapter,
    private readonly payPalFactory: PayPalFactory,
  ) {}

  async execute(): Promise<string> {
    try {
      const accessToken = await this.payPalAdapter.generateAccessToken();
      console.log(accessToken, 'accessToken PayPalCapturePayment');

      const baseUrl = await this.payPalFactory.getPayPalUrlsDependentEnv();
      const url = baseUrl + '/v2/checkout/orders';

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
