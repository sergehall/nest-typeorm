import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentDto } from '../dto/payment.dto';
import * as uuid4 from 'uuid4';
import { PaymentSystem } from '../enums/payment-system.enums';
import { CurrentUserDto } from '../../features/users/dto/current-user.dto';
import { UsersEntity } from '../../features/users/entities/users.entity';
import { GuestUsersDto } from '../../features/users/dto/guest-users.dto';
import { ProductRequest } from '../../features/products/dto/products-request.dto';
import { ProductsDataEntity } from '../../features/products/entities/products-data.entity';
import { GuestUsersEntity } from '../../features/products/entities/unregistered-users.entity';

@Injectable()
export class PaymentService {
  constructor() {}

  /**
   * Creates orders for the products to be bought.
   * @param productsRequest The products to be bought.
   * @param productsDataEntities The data of products fetched from the repository.
   * @param paymentSystem The payment system to be used.
   * @param currentUserDto The current user's data.
   * @returns Promise<PaymentDto[]>
   */
  async createPaymentDto(
    productsRequest: ProductRequest[],
    productsDataEntities: ProductsDataEntity[],
    paymentSystem: PaymentSystem,
    currentUserDto: CurrentUserDto | GuestUsersDto,
  ): Promise<PaymentDto[]> {
    return new Promise<PaymentDto[]>((resolve, reject) => {
      const orderArr: PaymentDto[] = [];
      const orderId: string = uuid4();
      const createdAt: string = new Date().toISOString();
      const client: UsersEntity | GuestUsersEntity =
        this.createClientFromDto(currentUserDto);

      try {
        for (const product of productsRequest) {
          const productData: ProductsDataEntity | undefined =
            productsDataEntities.find(
              (data) => data.productId === product.productId,
            );

          if (productData) {
            const totalPrice: string = (
              product.quantity * Number(productData.unitAmount)
            ).toFixed(2);
            const order: PaymentDto = {
              orderId: orderId,
              productId: product.productId,
              name: productData.name,
              description: productData.description,
              client: client,
              createdAt: createdAt,
              quantity: product.quantity,
              unitAmount: productData.unitAmount,
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

  private createClientFromDto(
    currentUserDto: CurrentUserDto | GuestUsersDto,
  ): UsersEntity | GuestUsersEntity {
    if ('userId' in currentUserDto) {
      const user = new UsersEntity();
      user.userId = currentUserDto.userId;
      user.login = currentUserDto.login;
      user.email = currentUserDto.email;
      user.roles = currentUserDto.roles;
      user.isBanned = currentUserDto.isBanned;
      user.orgId = currentUserDto.orgId;
      // Additional logic for CurrentUserDto if needed
      return user;
    } else {
      const guestUser = new GuestUsersEntity();
      guestUser.guestUserId = currentUserDto.guestUserId;
      guestUser.roles = currentUserDto.roles;
      guestUser.isBanned = currentUserDto.isBanned;
      // Additional logic for GuestUsersDto if needed
      return guestUser;
    }
  }
}
