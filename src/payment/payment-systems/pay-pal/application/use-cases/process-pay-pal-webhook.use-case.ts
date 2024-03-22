import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FinalizeStripePaymentCommand } from '../../../stripe/application/use-cases/finalize-stripe-payment.use-case';
import { FinalizePayPalPaymentCommand } from './finalize-pay-pal-payment.use-case';

export class ProcessPayPalWebhookCommand {
  constructor(public rawBodyRequest: RawBodyRequest<Request>) {}
}

@CommandHandler(ProcessPayPalWebhookCommand)
export class ProcessPayPalWebhookUseCase
  implements ICommandHandler<ProcessPayPalWebhookCommand>
{
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: ProcessPayPalWebhookCommand) {
    const { rawBodyRequest } = command;

    try {
      if (rawBodyRequest.body) {
        const event = rawBodyRequest.body.event_type;
        switch (event) {
          case 'checkout.session.completed':
            console.log(event, 'checkout.session.completed');
            await this.commandBus.execute(
              new FinalizePayPalPaymentCommand(event.data.object),
            );
            break;
          case 'charge.succeeded':
            console.log(event, 'charge.succeeded');
            break;
          case 'payment_intent.succeeded':
            console.log(event, 'event payment_intent.succeeded');
            break;
          case 'payment_intent.created':
            console.log(event, 'event payment_intent.created');
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
