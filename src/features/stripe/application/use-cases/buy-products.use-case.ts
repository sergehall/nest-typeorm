import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BuyRequestDto } from '../../../blogs/dto/buy-request.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { StripeAdapter } from '../../adapter/stripe-adapter';

export class BuyProductsCommand {
  constructor(
    public buyRequest: BuyRequestDto,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(BuyProductsCommand)
export class BuyProductsUseCase implements ICommandHandler<BuyProductsCommand> {
  constructor(private readonly stripeAdapter: StripeAdapter) {}

  async execute(command: BuyProductsCommand): Promise<any> {
    try {
      const { buyRequest, currentUserDto } = command;

      // // Extract productIds and quantities from the request
      // const productIds = buyRequest.products.map(
      //   (product) => product.productId,
      // );
      // const quantities = buyRequest.products.map((product) => product.quantity);
      //
      // // Transfer products
      // const transferResults = [];
      // for (let i = 0; i < productIds.length; i++) {
      //   const productId = productIds[i];
      //   const quantity = quantities[i];
      //
      //   // Process the transfer logic using stripeService
      //   const result = await this.stripeService.transferProduct(
      //     productId,
      //     quantity,
      //     currentUserDto.userId,
      //   );
      //   transferResults.push(result);
      // }
      //
      // // Return response
      // return transferResults;
      return await this.stripeAdapter.createCheckoutSession(
        buyRequest,
        currentUserDto,
      );
    } catch (error) {
      // Handle errors
      throw new InternalServerErrorException(error.message);
    }
  }
}
