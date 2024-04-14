import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { StripeFactory } from '../../factory/stripe-factory';
import { StripeConfig } from '../../../../../config/stripe/stripe.config';

export class ConstructStripeEventCommand {
  constructor(public rawBodyRequest: RawBodyRequest<Request>) {}
}

@CommandHandler(ConstructStripeEventCommand)
export class ConstructStripeEventUseCase
  implements ICommandHandler<ConstructStripeEventCommand>
{
  constructor(
    private readonly stripeConfig: StripeConfig,
    private readonly stripeFactory: StripeFactory,
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

        // const stripeInstance: Stripe =
        //   await this.stripeAdapter.createStripeInstance();
        const stripeInstance: Stripe =
          await this.stripeFactory.createStripeInstance();

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
