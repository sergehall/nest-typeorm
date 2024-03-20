import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeAdapter } from '../../adapter/stripe-adapter';
import { StripeConfig } from '../../../../../config/stripe/stripe.config';
import Stripe from 'stripe';

export class ConstructStripeEventCommand {
  constructor(public rawBodyRequest: RawBodyRequest<Request>) {}
}

@CommandHandler(ConstructStripeEventCommand)
export class ConstructStripeEventUseCase
  implements ICommandHandler<ConstructStripeEventCommand>
{
  constructor(
    private readonly stripeConfig: StripeConfig,
    private readonly stripeAdapter: StripeAdapter,
  ) {}

  async execute(
    command: ConstructStripeEventCommand,
  ): Promise<Stripe.Event | undefined> {
    const { rawBodyRequest } = command;

    try {
      const stripeWebhookSecret =
        await this.stripeConfig.getStripeWebhookSecret('STRIPE_WEBHOOK_SECRET');

      if (
        rawBodyRequest.headers['stripe-signature'] &&
        rawBodyRequest.rawBody &&
        stripeWebhookSecret
      ) {
        const signature = rawBodyRequest.headers['stripe-signature'];

        const stripeInstance: Stripe =
          await this.stripeAdapter.createStripeInstance();

        return stripeInstance.webhooks.constructEvent(
          rawBodyRequest.rawBody,
          signature,
          stripeWebhookSecret,
        );
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error constructStripeEvent' + error.message,
      );
    }
  }
}
