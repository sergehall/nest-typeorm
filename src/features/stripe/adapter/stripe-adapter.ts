import { Injectable } from '@nestjs/common';
import { StripeFactory } from '../../../config/stripe/stripe-factory';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import Stripe from 'stripe';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { Currency } from '../../../common/payment/enums/currency.enums';
import { ProductsDataEntity } from '../../../common/products/entities/products-data.entity';

@Injectable()
export class StripeAdapter {
  constructor(
    private readonly stripeFactory: StripeFactory,
    private readonly postgresConfig: PostgresConfig,
  ) {}

  async createCheckoutSession(
    productsData: ProductsDataEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    // // Get product IDs from buyRequest
    // const productIds = buyRequest.products.map(
    //   (product: any) => product.productId,
    // );
    //
    // // Fetch product data from repository
    // const productsData: ProductsDataEntity[] =
    //   await this.productsRepo.getProducts(productIds);

    // Create Stripe instance and retrieve URLs
    const [stripeInstance, successUrl, cancelUrl] = await Promise.all([
      this.createStripeInstance(),
      this.getStripeUrls('success'),
      this.getStripeUrls('cancel'),
    ]);

    // Prepare line items for checkout session
    const lineItems = productsData.map((product: any) => {
      const productData = productsData.find(
        (data) => data.id === product.productId,
      );
      return {
        price_data: {
          product_data: {
            name: productData?.name || 'Product Name not found',
            description:
              productData?.description || 'Product Description not found',
          },
          unit_amount: productData?.unit_amount
            ? productData.unit_amount * 100
            : 0, // Assuming the price is in USD cents
          currency: Currency.USD,
        },
        quantity: product.quantity,
      };
    });

    // Create checkout session
    return await stripeInstance.checkout.sessions.create({
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: lineItems,
      mode: 'payment',
      client_reference_id: currentUserDto?.userId || 'test-clientReferenceId',
    });
  }

  async getStripeUrls(key: 'success' | 'cancel'): Promise<string> {
    const baseUrl = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const urlMap: { [key in 'success' | 'cancel']: string } = {
      success: '/stripe/success',
      cancel: '/stripe/cancel',
    };
    return `${baseUrl}${urlMap[key]}`;
  }

  async createStripeInstance(): Promise<Stripe> {
    return this.stripeFactory.createStripeInstance();
  }
}
