import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PaymentStripeDto } from '../dto/payment-stripe.dto';
import * as uuid4 from 'uuid4';
import { ProductRequest } from '../../../../common/products/dto/products-request.dto';
import { ProductsDataEntity } from '../../../../common/products/entities/products-data.entity';
import { PaymentSystem } from '../../../enums/payment-system.enums';
import { CurrentUserDto } from '../../../../features/users/dto/current-user.dto';
import { UsersEntity } from '../../../../features/users/entities/users.entity';
import { GuestUsersDto } from '../../../../features/users/dto/guest-users.dto';
import { GuestUsersEntity } from '../../../../common/products/entities/unregistered-users.entity';

@Injectable()
export class StripeService {
  constructor() {}

  /**
   * Creates orders for the products to be bought.
   * @param productsRequest The products to be bought.
   * @param productsDataEntities The data of products fetched from the repository.
   * @param paymentSystem The payment system to be used.
   * @param currentUserDto The current user's data.
   * @returns Promise<PaymentStripeDto[]>
   */
  async createPaymentStripeDto(
    productsRequest: ProductRequest[],
    productsDataEntities: ProductsDataEntity[],
    paymentSystem: PaymentSystem,
    currentUserDto: CurrentUserDto | GuestUsersDto,
  ): Promise<PaymentStripeDto[]> {
    return new Promise<PaymentStripeDto[]>((resolve, reject) => {
      const orderArr: PaymentStripeDto[] = [];
      const orderId: string = uuid4();
      const createdAt: string = new Date().toISOString();

      const client =
        currentUserDto instanceof CurrentUserDto
          ? (() => {
              const user = new UsersEntity();
              user.userId = currentUserDto.userId;
              return user;
            })()
          : (() => {
              const guestUser = new GuestUsersEntity();
              guestUser.guestUserId = currentUserDto.guestUserId;
              return guestUser;
            })();

      try {
        for (const product of productsRequest) {
          const productData: ProductsDataEntity | undefined =
            productsDataEntities.find(
              (data) => data.productId === product.productId,
            );

          if (productData && product.quantity <= productData.stockQuantity) {
            const totalPrice: string = (
              product.quantity * Number(productData.unit_amount)
            ).toFixed(2);
            const order: PaymentStripeDto = {
              orderId: orderId,
              productId: product.productId,
              name: productData.name,
              description: productData.description,
              client: client,
              createdAt: createdAt,
              quantity: product.quantity,
              unit_amount: productData.unit_amount,
              totalPrice: totalPrice,
              currency: productData.currency,
              paymentSystem: paymentSystem,
            };
            orderArr.push(order);
          } else {
            console.log(
              `Product with productId ${product.productId} is out of stock or not found.`,
            );
          }
        }

        if (orderArr.length === 0) {
          reject(
            new InternalServerErrorException('No valid orders were created.'),
          );
        } else {
          resolve(orderArr);
        }
      } catch (error) {
        reject(error); // Forwarding any unexpected errors
      }
    });
  }
}
