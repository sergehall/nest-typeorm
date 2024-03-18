import { PaymentSystem } from '../enums/payment-system.enums';
import { Injectable } from '@nestjs/common';
import { StripeAdapter } from '../payment-systems/stripe/adapter/stripe-adapter';
import { PaymentStripeDto } from '../payment-systems/stripe/dto/payment-stripe.dto';

@Injectable()
export class PaymentManager {
  constructor(
    private readonly stripeAdapter: StripeAdapter,
    // Inject adapters for other payment systems if needed
  ) {}
  async processPayment(
    paymentDto: any,
    paymentSystem: PaymentSystem,
  ): Promise<void> {
    switch (paymentSystem) {
      case PaymentSystem.STRIPE:
        await this.processStripePayment(paymentDto);
        break;
      case PaymentSystem.PAYPAL:
        await this.processPayPalPayment(paymentDto);
        break;
      case PaymentSystem.APPLE_PAY:
        await this.processApplePayPayment(paymentDto);
        break;
      case PaymentSystem.GOOGLE_PAY:
        await this.processGooglePayPayment(paymentDto);
        break;
      case PaymentSystem.VENMO:
        await this.processVenmoPayment(paymentDto);
        break;
      case PaymentSystem.BITCOIN:
        await this.processBitcoinPayment(paymentDto);
        break;
      case PaymentSystem.VISA_CHECKOUT:
        await this.processVisaCheckoutPayment(paymentDto);
        break;
      case PaymentSystem.AMERICAN_EXPRESS_CHECKOUT:
        await this.processAmexCheckoutPayment(paymentDto);
        break;
      // Add cases for other payment systems as needed
      default:
        console.log(`Payment system '${paymentSystem}' is not supported.`);
        throw new Error(`Payment system '${paymentSystem}' is not supported.`);
    }
  }

  private async processStripePayment(
    paymentStripeDto: PaymentStripeDto[],
  ): Promise<void> {
    // Call the appropriate method from StripeAdapter
    const session =
      await this.stripeAdapter.createCheckoutSession(paymentStripeDto);
    console.log('session', session);
  }

  private async processPayPalPayment(paymentDto: any): Promise<void> {
    console.log(`Processing PayPal payment of $${paymentDto}`);
    // Your PayPal payment processing logic here
  }

  private async processApplePayPayment(paymentDto: any): Promise<void> {
    console.log(`Processing Apple Pay payment of $${paymentDto}`);
    // Your Apple Pay payment processing logic here
  }

  private async processGooglePayPayment(paymentDto: any): Promise<void> {
    console.log(`Processing Google Pay payment of $${paymentDto}`);
    // Your Google Pay payment processing logic here
  }

  private async processVenmoPayment(paymentDto: any): Promise<void> {
    console.log(`Processing Venmo payment of $${paymentDto}`);
    // Your Venmo payment processing logic here
  }

  private async processBitcoinPayment(paymentDto: any): Promise<void> {
    console.log(`Processing Bitcoin payment of $${paymentDto}`);
    // Your Bitcoin payment processing logic here
  }

  private async processVisaCheckoutPayment(paymentDto: any): Promise<void> {
    console.log(`Processing Visa Checkout payment of $${paymentDto}`);
    // Your Visa Checkout payment processing logic here
  }

  private async processAmexCheckoutPayment(paymentDto: any): Promise<void> {
    console.log(
      `Processing American Express Checkout payment of $${paymentDto}`,
    );
    // Your American Express Checkout payment processing logic here
  }
  // Add private async methods for processing other payment systems as needed
}
