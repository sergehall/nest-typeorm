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

  async execute(command: PayPalCapturePaymentCommand): Promise<any> {
    const { link, reference_id } = command;
    try {
      console.log('------------------------------------');
      console.log(link, 'link');
      console.log(reference_id, 'reference_id');
      const accessToken = await this.commandBus.execute(
        new PayPalGenerateAccessTokenCommand(),
      );

      console.log(accessToken, 'accessToken ');

      const response = await axios.post(
        link,
        {},
        {
          headers: {
            'PayPal-Request-Id': reference_id,
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log('------------------------------------');

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to PayPalCapturePayment',
        error.message,
      );
    }
  }
}
