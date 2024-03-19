import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

export class ProcessChargeSucceededCommand {
  constructor(public event: Stripe.Event) {}
}

@CommandHandler(ProcessChargeSucceededCommand)
export class ProcessStripeChargeSucceededUseCase
  implements ICommandHandler<ProcessChargeSucceededCommand>
{
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: ProcessChargeSucceededCommand): Promise<string> {
    const { event } = command;
    console.log(event, 'event 3');
    try {
      const objectStrie = event.data.object;
      console.log(objectStrie, 'objectStripe');
      return 'The purchase was successfully completed';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
