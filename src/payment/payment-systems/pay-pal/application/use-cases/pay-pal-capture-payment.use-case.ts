import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalAdapter } from '../../adapter/pay-pal.adapter';

export class PayPalCapturePaymentCommand {
  constructor(
    public link: string,
    public reference_id: string,
  ) {}
}

@CommandHandler(PayPalCapturePaymentCommand)
export class PayPalCapturePaymentUseCase
  implements ICommandHandler<PayPalCapturePaymentCommand>
{
  constructor(private readonly payPalAdapter: PayPalAdapter) {}

  async execute(command: PayPalCapturePaymentCommand): Promise<string> {
    const { link, reference_id } = command;
    try {
      const accessToken =
        await this.payPalAdapter.generateAccessToken('PAYPAL_CLIENT_ID');

      const response = await axios.post(
        link,
        {},
        {
          headers: {
            'PayPal-Request-Id': reference_id,
            Authorization: `Bearer access_token${accessToken}`,
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
