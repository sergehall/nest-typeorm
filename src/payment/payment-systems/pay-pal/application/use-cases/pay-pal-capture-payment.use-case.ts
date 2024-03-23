import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalAdapter } from '../../adapter/pay-pal.adapter';
import { PayPalFactory } from '../../../../../config/pay-pal/pay-pal-factory';

export class PayPalCapturePaymentCommand {
  constructor(public id: string) {}
}

@CommandHandler(PayPalCapturePaymentCommand)
export class PayPalCapturePaymentUseCase
  implements ICommandHandler<PayPalCapturePaymentCommand>
{
  constructor(
    private readonly payPalAdapter: PayPalAdapter,
    private readonly payPalFactory: PayPalFactory,
  ) {}

  async execute(command: PayPalCapturePaymentCommand): Promise<string> {
    const { id } = command;
    try {
      const accessToken =
        await this.payPalAdapter.generateAccessToken('PAYPAL_CLIENT_ID');
      console.log(accessToken, 'accessToken PayPalCapturePayment');

      const baseUrl = await this.payPalFactory.getPayPalUrlsDependentEnv();
      const url = baseUrl + `/v2/checkout/orders/${id}/capture`;

      const response = await axios.post(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

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
