import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
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
      console.log(link, 'link');
      console.log(reference_id, 'reference_id');
      const accessToken = await this.commandBus.execute(
        new PayPalGenerateAccessTokenCommand('PAYPAL_CLIENT_ID'),
      );

      console.log(accessToken, 'accessToken ');
      console.log('------------------------------------');

      const response = await axios({
        url: link,
        method: 'POST',
        headers: {
          'PayPal-Request-Id': reference_id,
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
