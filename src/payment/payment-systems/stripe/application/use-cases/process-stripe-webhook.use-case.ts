import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeAdapter } from '../../adapter/stripe-adapter';
import { StripeConfig } from '../../../../../config/stripe/stripe.config';
import Stripe from 'stripe';

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
      const event = await this.constructStripeEvent(rawBodyRequest);

      if (!event) {
        return true;
      }

      switch (event.type) {
        case 'checkout.session.completed':
          console.log(event, 'event');
          const clientReferenceId = event.data.object.client_reference_id;
          // Do something with clientReferenceId
          break;
        default:
          // Handle other webhook events
          break;
      }
      // }
      return true;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async constructStripeEvent(
    rawBodyRequest: RawBodyRequest<Request>,
  ): Promise<Stripe.Event | undefined> {
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

// export class ProcessStripeWebHookCommand {
//   constructor(public rawBodyRequest: RawBodyRequest<Request>) {}
// }
//
// @CommandHandler(ProcessStripeWebHookCommand)
// export class ProcessStripeWebHookUseCase
//   implements ICommandHandler<ProcessStripeWebHookCommand>
// {
//   constructor(
//     private readonly stripeConfig: StripeConfig,
//     private readonly stripeAdapter: StripeAdapter,
//   ) {}
//
//   async execute(command: ProcessStripeWebHookCommand) {
//     const { rawBodyRequest } = command;
//
//     try {
//       if (
//         rawBodyRequest.headers['stripe-signature'] &&
//         rawBodyRequest.rawBody
//       ) {
//         const stripeWebhookSecret =
//           await this.stripeConfig.getStripeWebhookSecret(
//             'STRIPE_WEBHOOK_SECRET',
//           );
//         const signature = rawBodyRequest.headers['stripe-signature'];
//
//         const stripeInstance = await this.stripeAdapter.createStripeInstance();
//
//         const event = stripeInstance.webhooks.constructEvent(
//           rawBodyRequest.rawBody,
//           signature,
//           stripeWebhookSecret,
//         );
//         if (event.type === 'checkout.session.completed') {
//           const clientReferenceId = event.data.object.client_reference_id;
//
//           // finish the implementation
//           // finishCommand(clientReferenceId, event);
//           console.log(event, 'event');
//           console.log(clientReferenceId, 'clientReferenceId2');
//           console.log('Payment was successful');
//         }
//       }
//       return true;
//     } catch (error) {
//       console.error(error);
//       throw new InternalServerErrorException(error.message);
//     }
//   }
// }
