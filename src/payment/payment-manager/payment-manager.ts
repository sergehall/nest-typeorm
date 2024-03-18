import { PaymentSystem } from '../enums/payment-system.enums';
import { Injectable } from '@nestjs/common';
import { StripeAdapter } from '../payment-systems/stripe/adapter/stripe-adapter';
import { PaymentStripeDto } from '../payment-systems/stripe/dto/payment-stripe.dto';
import { PaymentLinkDto } from '../dto/payment-link.dto';

@Injectable()
export class PaymentManager {
  constructor(
    private readonly stripeAdapter: StripeAdapter,
    // Inject adapters for other payment systems if needed
  ) {}
  async processPayment(
    paymentDto: any,
    paymentSystem: PaymentSystem,
  ): Promise<PaymentLinkDto | null> {
    switch (paymentSystem) {
      case PaymentSystem.STRIPE:
        return await this.processStripePayment(paymentDto);

      case PaymentSystem.PAYPAL:
        return await this.processPayPalPayment(paymentDto);
      case PaymentSystem.APPLE_PAY:
        return await this.processApplePayPayment(paymentDto);
      case PaymentSystem.GOOGLE_PAY:
        return await this.processGooglePayPayment(paymentDto);
      case PaymentSystem.VENMO:
        return await this.processVenmoPayment(paymentDto);
      case PaymentSystem.BITCOIN:
        return await this.processBitcoinPayment(paymentDto);
      case PaymentSystem.VISA_CHECKOUT:
        return await this.processVisaCheckoutPayment(paymentDto);
      case PaymentSystem.AMERICAN_EXPRESS_CHECKOUT:
        return await this.processAmexCheckoutPayment(paymentDto);

      // Add cases for other payment systems as needed
      default:
        console.log(`Payment system '${paymentSystem}' is not supported.`);
        throw new Error(`Payment system '${paymentSystem}' is not supported.`);
    }
  }

  private async processStripePayment(
    paymentStripeDto: PaymentStripeDto[],
  ): Promise<PaymentLinkDto | null> {
    // Call the appropriate method from StripeAdapter
    const session =
      await this.stripeAdapter.createCheckoutSession(paymentStripeDto);
    console.log('session', session);
    // write paymentLink to the database orderEntity
    if (!session.url) {
      return null;
    }
    return {
      paymentLink: session.url,
    };
  }

  private async processPayPalPayment(
    paymentDto: any,
  ): Promise<PaymentLinkDto | null> {
    console.log(`Processing PayPal payment of $${paymentDto}`);
    // Your PayPal payment processing logic here
    return null;
  }

  private async processApplePayPayment(
    paymentDto: any,
  ): Promise<PaymentLinkDto | null> {
    console.log(`Processing Apple Pay payment of $${paymentDto}`);
    // Your Apple Pay payment processing logic here
    return null;
  }

  private async processGooglePayPayment(
    paymentDto: any,
  ): Promise<PaymentLinkDto | null> {
    console.log(`Processing Google Pay payment of $${paymentDto}`);
    // Your Google Pay payment processing logic here
    return null;
  }

  private async processVenmoPayment(
    paymentDto: any,
  ): Promise<PaymentLinkDto | null> {
    console.log(`Processing Venmo payment of $${paymentDto}`);
    // Your Venmo payment processing logic here
    return null;
  }

  private async processBitcoinPayment(
    paymentDto: any,
  ): Promise<PaymentLinkDto | null> {
    console.log(`Processing Bitcoin payment of $${paymentDto}`);
    // Your Bitcoin payment processing logic here
    return null;
  }

  private async processVisaCheckoutPayment(
    paymentDto: any,
  ): Promise<PaymentLinkDto | null> {
    console.log(`Processing Visa Checkout payment of $${paymentDto}`);
    // Your Visa Checkout payment processing logic here
    return null;
  }

  private async processAmexCheckoutPayment(
    paymentDto: any,
  ): Promise<PaymentLinkDto | null> {
    console.log(
      `Processing American Express Checkout payment of $${paymentDto}`,
    );
    return null;
    // Your American Express Checkout payment processing logic here
  }
  // Add private async methods for processing other payment systems as needed
}
