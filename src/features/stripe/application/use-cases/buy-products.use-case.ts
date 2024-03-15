import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BuyRequestDto } from '../../../blogs/dto/buy-request.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { StripeService } from '../stripe.service';
import Stripe from 'stripe';

export class BuyProductsCommand {
  constructor(
    public buyRequest: BuyRequestDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(BuyProductsCommand)
export class BuyProductsUseCase implements ICommandHandler<BuyProductsCommand> {
  constructor(private readonly stripeService: StripeService) {}

  async execute(command: BuyProductsCommand): Promise<any> {
    try {
      const { buyRequest, currentUserDto } = command;

      const stripe = new Stripe(
        'sk_test_51OuR1pBCX0DjbSyLRcK5s6tcgKm6GXlE8I4wP8aIMYMMKMMxdWdlFYN6darC7XdmWoUzDr5vYKCuXRsXAK9ncucQ00h8HNOS5P',
      );

      // Extract productIds and quantities from the request
      const productIds = buyRequest.products.map(
        (product) => product.productId,
      );
      const quantities = buyRequest.products.map((product) => product.quantity);

      // Transfer products
      const transferResults = [];
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];
        const quantity = quantities[i];

        // Process the transfer logic using stripeService
        const result = await this.stripeService.transferProduct(
          productId,
          quantity,
          currentUserDto.userId,
        );
        transferResults.push(result);
      }

      // Return response
      return transferResults;
    } catch (error) {
      // Handle errors
      throw new InternalServerErrorException(error.message);
    }
  }
}
