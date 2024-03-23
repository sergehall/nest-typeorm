import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalAdapter } from '../../adapter/pay-pal.adapter';
import { PayPalGenerateAccessTokenCommand } from './pay-pal-generate-access-token.use-case';

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
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: PayPalCapturePaymentCommand): Promise<string> {
    const { link, reference_id } = command;
    try {
      console.log('------------------------------------');
      const accessToken = await this.commandBus.execute(
        new PayPalGenerateAccessTokenCommand('PAYPAL_CLIENT_ID'),
      );

      console.log(accessToken, 'accessToken PayPalCapturePayment');
      console.log('------------------------------------');
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
