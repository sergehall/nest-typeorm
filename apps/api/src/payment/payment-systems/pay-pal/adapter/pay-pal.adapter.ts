import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PayPalGenerateAccessTokenCommand } from '../application/use-cases/pay-pal-generate-access-token.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { PaymentDto } from '../../../dto/payment.dto';
import { IntentsEnums } from '../../../enums/intents.enums';
import { Amount, Item, PayPaPurchaseUnitsType } from '../types/pay-pal-create-order.type';
import { PaymentService } from '../../../application/payment.service';
import { ReferenceIdType } from '../../types/reference-id.type';
import { getPayPalApiBaseUrl } from '../enums/pay-pal-urls.enum';
import {
  isPayerActionRequired,
  PayerActionRequiredType,
} from '../types/payer-action-required.type';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { UsersEntity } from '../../../../features/users/entities/users.entity';
import { GuestUsersEntity } from '../../../../features/products/entities/unregistered-users.entity';
import { requestExternalJson } from '../../../../common/http/external-json-client';

type PayPalPaymentSource = {
  readonly paypal: {
    readonly experience_context: {
      readonly payment_method_preference: 'UNRESTRICTED';
      readonly brand_name: string;
      readonly locale: string;
      readonly landing_page: 'LOGIN' | 'GUEST_CHECKOUT';
      readonly shipping_preference: 'SET_PROVIDED_ADDRESS';
      readonly payment_method_selected: 'PAYPAL';
      readonly user_action: 'PAY_NOW';
      readonly return_url: string;
      readonly cancel_url: string;
    };
  };
};

@Injectable()
export class PayPalAdapter {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentService: PaymentService,
    private readonly postgresConfig: PostgresConfig,
  ) {}

  async createCheckoutOrder(paymentDto: PaymentDto[]): Promise<PayerActionRequiredType> {
    try {
      const accessToken = await this.commandBus.execute(new PayPalGenerateAccessTokenCommand());

      return await this.payPalCreateOrder(paymentDto, accessToken);
    } catch (error: unknown) {
      throw new InternalServerErrorException('Failed to create checkout order', { cause: error });
    }
  }

  private async payPalCreateOrder(
    paymentDto: PaymentDto[],
    accessToken: string,
  ): Promise<PayerActionRequiredType> {
    if (paymentDto.length === 0) throw new InternalServerErrorException('PaymentDto is empty');

    const baseUrl = getPayPalApiBaseUrl();
    const path = '/v2/checkout/orders';
    const url = baseUrl + path;

    const mapToPurchaseUnits = await this.mapToPurchaseUnits(paymentDto);

    const payPalRequestId = mapToPurchaseUnits[0].reference_id;

    const client: UsersEntity | GuestUsersEntity = paymentDto[0].client;
    const paymentSource = await this.getPaymentSource(client);

    const data = {
      intent: IntentsEnums.CAPTURE,
      purchase_units: mapToPurchaseUnits,
      payment_source: paymentSource,
    };

    const headers = this.getHeaders(payPalRequestId, accessToken);

    try {
      return await requestExternalJson({
        provider: 'PayPal Orders API',
        url,
        init: {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        },
        validate: isPayerActionRequired,
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException('Failed to create PayPal order', { cause: error });
    }
  }

  private async mapToPurchaseUnits(paymentDto: PaymentDto[]): Promise<PayPaPurchaseUnitsType[]> {
    const purchaseUnits: PayPaPurchaseUnitsType[] = [];

    const shipping = {
      address: {
        address_line_1: 'Hollywood 123',
        address_line_2: 'apt. 17',
        admin_area_2: 'Los Angeles',
        admin_area_1: 'CA',
        postal_code: '95131',
        country_code: 'US',
      },
    };

    const referenceIdDto: ReferenceIdType =
      await this.paymentService.generateReferenceId(paymentDto);
    const referenceId: string = referenceIdDto.referenceId;

    const currencyCode = paymentDto[0].currency;

    const items: Item[] = [];
    let totalAmount = 0;

    for (const payment of paymentDto) {
      const item: Item = {
        name: payment.name,
        description: payment.description,
        quantity: payment.quantity.toString(),
        unit_amount: {
          currency_code: payment.currency,
          value: payment.unitAmount,
        },
      };
      items.push(item);

      // Accumulate total amount
      totalAmount += parseFloat(payment.unitAmount) * payment.quantity;
    }

    // Set total amount for all items
    const amount: Amount = {
      currency_code: currencyCode,
      value: totalAmount.toFixed(2),
      breakdown: {
        item_total: {
          currency_code: currencyCode,
          value: totalAmount.toFixed(2),
        },
      },
    };

    purchaseUnits.push({
      reference_id: referenceId,
      items: items,
      amount: amount,
      shipping: shipping,
    });

    return purchaseUnits;
  }

  private getHeaders(payPalRequestId: string, accessToken: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'PayPal-Request-Id': payPalRequestId,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  private async getPaymentSource(
    client: UsersEntity | GuestUsersEntity,
  ): Promise<PayPalPaymentSource> {
    const landingPage = client instanceof UsersEntity ? 'LOGIN' : 'GUEST_CHECKOUT';
    // payment_method_preference: 'UNRESTRICTED'  || 'IMMEDIATE_PAYMENT_REQUIRED'
    const domain: string = await this.postgresConfig.getPostgresConfig('PG_DOMAIN_HEROKU');
    return {
      paypal: {
        experience_context: {
          payment_method_preference: 'UNRESTRICTED',
          brand_name: 'IT-INCUBATOR INC',
          locale: 'en-US',
          landing_page: landingPage,
          shipping_preference: 'SET_PROVIDED_ADDRESS',
          payment_method_selected: 'PAYPAL',
          user_action: 'PAY_NOW',
          return_url: `${domain}/pay-pal/success`,
          cancel_url: `${domain}/pay-pal/cancel`,
        },
      },
    };
  }

  // async generateAccessToken2(key: PayPalKeysType): Promise<string> {
  //   return this.commandBus.execute(new PayPalGenerateAccessTokenCommand(key));
  // }
}
