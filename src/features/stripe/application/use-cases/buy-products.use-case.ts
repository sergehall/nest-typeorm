import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BuyRequestDto, ProductDto } from '../../../blogs/dto/buy-request.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { BadRequestException } from '@nestjs/common';
import { PaymentManager } from '../../../../common/payment/payment-manager/payment-manager';
import { PaymentSystem } from '../../../../common/payment/enums/payment-system.enums';
import { ProductsRepo } from '../../../../common/products/infrastructure/products.repo';

export class BuyProductsCommand {
  constructor(
    public buyRequest: BuyRequestDto,
    public paymentSystem: PaymentSystem,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(BuyProductsCommand)
export class BuyProductsUseCase implements ICommandHandler<BuyProductsCommand> {
  constructor(
    private readonly paymentManager: PaymentManager,
    private readonly productsRepo: ProductsRepo,
  ) {}

  async execute(command: BuyProductsCommand): Promise<void> {
    const { buyRequest, paymentSystem, currentUserDto } = command;

    const products = buyRequest.products;

    // const productsData: string | ProductsDataEntity[] =
    //   await this.productsRepo.getProductsByIds(products);

    await this.verifiedQuantities(products);

    await this.paymentManager.processPayment(
      products,
      paymentSystem,
      currentUserDto,
    );
    return;
    // if (productsData instanceof Array) {
    //   await this.paymentManager.processPayment(
    //     productsData,
    //     paymentSystem,
    //     currentUserDto,
    //   );
    //   return;
    // }
    //
    // throw new BadRequestException({
    //   message: {
    //     message: productsData,
    //     field: 'quantity',
    //   },
    // });
  }

  private async verifiedQuantities(productDto: ProductDto[]): Promise<void> {
    const insufficientProductsMessage: string | null =
      await this.productsRepo.checkProductQuantities(productDto);

    if (insufficientProductsMessage) {
      throw new BadRequestException({
        message: {
          message: insufficientProductsMessage,
          field: 'quantity',
        },
      });
    }
  }
}
