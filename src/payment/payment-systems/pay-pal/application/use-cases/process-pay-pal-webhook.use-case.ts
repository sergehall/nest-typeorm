import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FinalizePayPalPaymentCommand } from './finalize-pay-pal-payment.use-case';

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
        const event = rawBodyRequest.body.event_type;
        console.log(event, 'event');
        switch (event) {
          case 'CHECKOUT.ORDER.APPROVED':
            await this.commandBus.execute(
              new FinalizePayPalPaymentCommand(event.data),
            );
            break;
          case 'charge.succeeded':
            console.log(event, 'charge.succeeded');
            break;
          case 'payment_intent.succeeded':
            console.log(event, 'event payment_intent.succeeded');
            break;
          default:
            // Handle other webhook events
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
