import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { ConstructStripeEventCommand } from './construct-stripe-event.use-case';
import { ProcessChargeSucceededCommand } from './process-stripe-charge-succeeded.use-case';
import { StripeAdapter } from '../../adapter/stripe-adapter';
import { StripeChargeObjectType } from '../../types/stripe-charge-object.type';
import { StripeCheckoutSessionType } from '../../types/stripe-checkout-session.type';

export class ProcessStripeWebHookCommand {
  constructor(public rawBodyRequest: RawBodyRequest<Request>) {}
}

@CommandHandler(ProcessStripeWebHookCommand)
export class ProcessStripeWebHookUseCase
  implements ICommandHandler<ProcessStripeWebHookCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly stripeAdapter: StripeAdapter,
  ) {}

  async execute(command: ProcessStripeWebHookCommand) {
    const { rawBodyRequest } = command;

    const event: Stripe.Event | undefined = await this.commandBus.execute(
      new ConstructStripeEventCommand(rawBodyRequest),
    );
    console.log(event, 'event0');
    try {
      if (event) {
        const chargeObject = event.data.object;
        console.log(chargeObject, 'chargeObject');
        const stripeChargeObject = chargeObject as StripeCheckoutSessionType;
        const PAYMENT_INTENT_ID = stripeChargeObject.payment_intent;
        const stripeInstance: Stripe =
          await this.stripeAdapter.createStripeInstance();
        const intent = await stripeInstance.paymentIntents.retrieve(
          `${PAYMENT_INTENT_ID}`,
        );
        const latest_charge = intent.latest_charge;
        console.log(latest_charge, 'latest_charge');

        switch (event.type) {
          case 'checkout.session.completed':
            console.log(event, 'event1');
            const clientReferenceId = event.data.object.client_reference_id;
            console.log(clientReferenceId, 'clientReferenceId');
            // Do something with clientReferenceId
            break;
          case 'charge.succeeded':
            await this.commandBus.execute(
              new ProcessChargeSucceededCommand(event),
            );
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
