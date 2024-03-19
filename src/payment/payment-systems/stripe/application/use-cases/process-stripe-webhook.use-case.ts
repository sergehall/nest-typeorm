import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { ConstructStripeEventCommand } from './construct-stripe-event.use-case';
import { ProcessChargeSucceededCommand } from './process-stripe-charge-succeeded.use-case';
import { FinalizeOrderPaymentCommand } from './finalize-order-payment.use-case';

export class ProcessStripeWebHookCommand {
  constructor(public rawBodyRequest: RawBodyRequest<Request>) {}
}

@CommandHandler(ProcessStripeWebHookCommand)
export class ProcessStripeWebHookUseCase
  implements ICommandHandler<ProcessStripeWebHookCommand>
{
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: ProcessStripeWebHookCommand) {
    const { rawBodyRequest } = command;

    const event: Stripe.Event | undefined = await this.commandBus.execute(
      new ConstructStripeEventCommand(rawBodyRequest),
    );
    try {
      if (event) {
        switch (event.type) {
          case 'checkout.session.completed':
            console.log(event, 'checkout.session.completed');
            await this.commandBus.execute(
              new FinalizeOrderPaymentCommand(event.data.object),
            );
            break;
          case 'charge.succeeded':
            await this.commandBus.execute(
              new ProcessChargeSucceededCommand(event),
            );
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
