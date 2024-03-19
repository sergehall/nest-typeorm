import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { ConstructStripeEventCommand } from './construct-stripe-event.use-case';

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
    console.log(event, 'event0');
    try {
      if (event) {
        console.log(event, 'event1');
        switch (event.type) {
          case 'checkout.session.completed':
            console.log(event, 'event2');
            const clientReferenceId = event.data.object.client_reference_id;
            console.log(clientReferenceId, 'clientReferenceId');
            // Do something with clientReferenceId
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
