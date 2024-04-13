import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FinalizePayPalPaymentCommand } from './finalize-pay-pal-payment.use-case';
import { PayPalCapturePaymentCommand } from './pay-pal-capture-payment.use-case';

export class ProcessPayPalWebhookCommand {
  constructor(public rawBodyRequest: RawBodyRequest<Request>) {}
}

@CommandHandler(ProcessPayPalWebhookCommand)
export class ProcessPayPalWebhookUseCase
  implements ICommandHandler<ProcessPayPalWebhookCommand>
{
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: ProcessPayPalWebhookCommand): Promise<boolean> {
    const { rawBodyRequest } = command;

    try {
      if (rawBodyRequest.body) {
        const eventType = rawBodyRequest.body.event_type;
        switch (eventType) {
          case 'CHECKOUT.ORDER.APPROVED':
            await this.commandBus.execute(
              new PayPalCapturePaymentCommand(rawBodyRequest.body),
            );
            break;
          case 'PAYMENT.CAPTURE.COMPLETED':
            await this.commandBus.execute(
              new FinalizePayPalPaymentCommand(rawBodyRequest.body),
            );
            break;
          default:
            // Handle other webhook socket
            break;
        }
      }
      return true;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
