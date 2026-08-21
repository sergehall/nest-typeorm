import type Stripe from 'stripe';

export type StripeClient = InstanceType<typeof Stripe>;
export type StripeEvent = ReturnType<StripeClient['webhooks']['constructEvent']>;
export type StripeCheckoutSession = Extract<
  StripeEvent['data']['object'],
  { object: 'checkout.session' }
>;
