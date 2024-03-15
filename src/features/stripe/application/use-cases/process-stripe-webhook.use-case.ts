import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { StripeConfig } from '../../../../config/stripe/stripe.config';
import { StripeService } from '../stripe.service';
import { Request } from 'express';
import { StripeEvent } from '../../interfaces/stripeEvent.interface';
import Stripe from 'stripe';

export class ProcessStripeWebHookCommand {
  constructor(
    public request: Request,
    public stripeEvent: StripeEvent,
  ) {}
}

@CommandHandler(ProcessStripeWebHookCommand)
export class ProcessStripeWebHookUseCase
  implements ICommandHandler<ProcessStripeWebHookCommand>
{
  constructor(
    private readonly stripeConfig: StripeConfig,
    private readonly stripeService: StripeService,
  ) {}

  async execute(command: ProcessStripeWebHookCommand) {
    const { request, stripeEvent } = command;

    try {
      if (stripeEvent.type !== 'checkout.session.completed') {
        if (request.headers['stripe-signature']) {
          const stripeWebhookSecret =
            await this.stripeConfig.getStripeWebhookSecret(
              'STRIPE_WEBHOOK_SECRET',
            );
          const stripeHeader = request.headers['stripe-signature'];

          const stripeInstance =
            await this.stripeService.createStripeInstance('test');

          const event = stripeInstance.webhooks.constructEvent(
            command.request.body,
            stripeHeader,
            stripeWebhookSecret,
          );
          const session = event.data.object as Stripe.Checkout.Session;
          const clientReferenceId = session.client_reference_id;
          // finish the implementation
          // finishCommand(clientReferenceId, event);
          console.log(event, 'event');
          console.log(session, 'session');
          console.log(clientReferenceId, 'event');
          console.log('Payment was successful');
        }
      }
      return true;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
