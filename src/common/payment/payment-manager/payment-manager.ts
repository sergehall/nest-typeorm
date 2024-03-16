import { PaymentSystem } from '../enums/payment-system.enums';
import { StripeAdapter } from '../../../features/stripe/adapter/stripe-adapter';
import { CurrentUserDto } from '../../../features/users/dto/current-user.dto';
import { Injectable } from '@nestjs/common';
import { ProductsDataEntity } from '../../products/entities/products-data.entity';

@Injectable()
export class PaymentManager {
  constructor(
    private readonly stripeAdapter: StripeAdapter,
    // Inject adapters for other payment systems if needed
  ) {}
  async processPayment(
    payment: ProductsDataEntity[],
    paymentSystem: PaymentSystem,
    currentUserDto: CurrentUserDto | null,
  ): Promise<void> {
    switch (paymentSystem) {
      case PaymentSystem.PAYPAL:
        await this.processPayPalPayment(payment);
        break;
      case PaymentSystem.STRIPE:
        await this.processStripePayment(payment, currentUserDto);
        break;
      case PaymentSystem.APPLE_PAY:
        await this.processApplePayPayment(payment);
        break;
      case PaymentSystem.GOOGLE_PAY:
        await this.processGooglePayPayment(payment);
        break;
      case PaymentSystem.VENMO:
        await this.processVenmoPayment(payment);
        break;
      case PaymentSystem.BITCOIN:
        await this.processBitcoinPayment(payment);
        break;
      case PaymentSystem.VISA_CHECKOUT:
        await this.processVisaCheckoutPayment(payment);
        break;
      case PaymentSystem.AMERICAN_EXPRESS_CHECKOUT:
        await this.processAmexCheckoutPayment(payment);
        break;
      // Add cases for other payment systems as needed
      default:
        console.log(`Payment system '${paymentSystem}' is not supported.`);
        throw new Error(`Payment system '${paymentSystem}' is not supported.`);
    }
  }

  private async processStripePayment(
    productsData: ProductsDataEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<void> {
    // Call the appropriate method from StripeAdapter
    const session = await this.stripeAdapter.createCheckoutSession(
      productsData,
      currentUserDto,
    );
    console.log('session', session);
  }

  private async processPayPalPayment(
    payment: ProductsDataEntity[],
  ): Promise<void> {
    console.log(`Processing PayPal payment of $${payment}`);
    // Your PayPal payment processing logic here
  }

  private async processApplePayPayment(
    payment: ProductsDataEntity[],
  ): Promise<void> {
    console.log(`Processing Apple Pay payment of $${payment}`);
    // Your Apple Pay payment processing logic here
  }

  private async processGooglePayPayment(
    payment: ProductsDataEntity[],
  ): Promise<void> {
    console.log(`Processing Google Pay payment of $${payment}`);
    // Your Google Pay payment processing logic here
  }

  private async processVenmoPayment(
    payment: ProductsDataEntity[],
  ): Promise<void> {
    console.log(`Processing Venmo payment of $${payment}`);
    // Your Venmo payment processing logic here
  }

  private async processBitcoinPayment(
    payment: ProductsDataEntity[],
  ): Promise<void> {
    console.log(`Processing Bitcoin payment of $${payment}`);
    // Your Bitcoin payment processing logic here
  }

  private async processVisaCheckoutPayment(
    payment: ProductsDataEntity[],
  ): Promise<void> {
    console.log(`Processing Visa Checkout payment of $${payment}`);
    // Your Visa Checkout payment processing logic here
  }

  private async processAmexCheckoutPayment(
    payment: ProductsDataEntity[],
  ): Promise<void> {
    console.log(`Processing American Express Checkout payment of $${payment}`);
    // Your American Express Checkout payment processing logic here
  }
  // Add private async methods for processing other payment systems as needed
}
