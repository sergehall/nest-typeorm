import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BuyRequestDto } from '../../../blogs/dto/buy-request.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { PaymentManager } from '../../../../common/payment/payment-manager/payment-manager';
import { PaymentSystem } from '../../../../common/payment/enums/payment-system.enums';

export class BuyProductsCommand {
  constructor(
    public buyRequest: BuyRequestDto,
    public paymentSystem: PaymentSystem,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(BuyProductsCommand)
export class BuyProductsUseCase implements ICommandHandler<BuyProductsCommand> {
  constructor(private readonly paymentManager: PaymentManager) {}

  async execute(command: BuyProductsCommand): Promise<void> {
    try {
      const { buyRequest, paymentSystem, currentUserDto } = command;

      return await this.paymentManager.processPayment(
        buyRequest,
        paymentSystem,
        currentUserDto,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
