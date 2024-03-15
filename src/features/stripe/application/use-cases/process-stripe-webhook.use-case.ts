import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { StripeConfig } from '../../../../config/stripe/stripe.config';
import { StripeService } from '../stripe.service';
import { Request } from 'express';
import Stripe from 'stripe';

export class ProcessStripeWebHookCommand {
  constructor(
    public request: RawBodyRequest<Request>,
    public data: Stripe.Checkout.Session,
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
    const { request, data } = command;
    console.log('ProcessStripeWebHookCommand satrted');

    try {
      if (request.headers['stripe-signature'] && request.rawBody) {
        const stripeWebhookSecret =
          await this.stripeConfig.getStripeWebhookSecret(
            'STRIPE_WEBHOOK_SECRET',
          );
        const signature = request.headers['stripe-signature'];

        const stripeInstance =
          await this.stripeService.createStripeInstance('test');

        const event = stripeInstance.webhooks.constructEvent(
          request.rawBody,
          signature,
          stripeWebhookSecret,
        );
        if (event.type === 'checkout.session.completed') {
          const clientReferenceId = data.client_reference_id;
          const clientReferenceId2 = event.data.object.client_reference_id;

          // finish the implementation
          // finishCommand(clientReferenceId, event);
          console.log(event, 'event');
          console.log(clientReferenceId, 'clientReferenceId');
          console.log(clientReferenceId2, 'clientReferenceId2');
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
