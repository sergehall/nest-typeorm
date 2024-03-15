import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeFactory } from '../../../config/stripe/stripe-factory';

@Injectable()
export class StripeService {
  constructor(private readonly stripeFactory: StripeFactory) {}

  async createTestStripeInstance(): Promise<Stripe> {
    return this.stripeFactory.createStripeInstance('test');
  }

  async createLiveStripeInstance(): Promise<Stripe> {
    return this.stripeFactory.createStripeInstance('live');
  }

  async transferProduct(
    productId: string,
    quantity: number,
    userId: string,
  ): Promise<any> {
    // Simulate the transfer of a product to a user
    // Here, you can implement the logic to interact with Stripe or any other payment service

    // For demonstration purposes, let's just return a mock result
    return {
      success: true,
      productId,
      quantity,
      userId,
      message: `Product ${productId} transferred successfully to user ${userId}.`,
    };
  }
}
