import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { StripeConfig } from '../../../../config/stripe/stripe.config';
import { Request } from 'express';
import { StripeAdapter } from '../../adapter/stripe-adapter';

export class ProcessStripeWebHookCommand {
  constructor(public rawBodyRequest: RawBodyRequest<Request>) {}
}

@CommandHandler(ProcessStripeWebHookCommand)
export class ProcessStripeWebHookUseCase
  implements ICommandHandler<ProcessStripeWebHookCommand>
{
  constructor(
    private readonly stripeConfig: StripeConfig,
    private readonly stripeAdapter: StripeAdapter,
  ) {}

  async execute(command: ProcessStripeWebHookCommand) {
    const { rawBodyRequest } = command;

    try {
      if (
        rawBodyRequest.headers['stripe-signature'] &&
        rawBodyRequest.rawBody
      ) {
        const stripeWebhookSecret =
          await this.stripeConfig.getStripeWebhookSecret(
            'STRIPE_WEBHOOK_SECRET',
          );
        const signature = rawBodyRequest.headers['stripe-signature'];

        const stripeInstance = await this.stripeAdapter.createStripeInstance();

        const event = stripeInstance.webhooks.constructEvent(
          rawBodyRequest.rawBody,
          signature,
          stripeWebhookSecret,
        );
        if (event.type === 'checkout.session.completed') {
          const clientReferenceId = event.data.object.client_reference_id;

          // finish the implementation
          // finishCommand(clientReferenceId, event);
          console.log(event, 'event');
          console.log(clientReferenceId, 'clientReferenceId2');
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
