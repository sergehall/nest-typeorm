import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeChargeObjectType } from '../../types/stripe-charge-object.type';

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
      const stripeObject = event.data as StripeChargeObjectType;
      const receiptUrl = stripeObject.receipt_url;
      // if (hasOwnPropertyReceiptUrl) {
      //   const receiptUrl = event.data.object['receipt_url'];
      // }
      //
      console.log(receiptUrl, 'receiptUrl');
      return 'The purchase was successfully completed';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
