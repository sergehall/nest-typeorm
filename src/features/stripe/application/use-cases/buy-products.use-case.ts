import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BuyRequestDto } from '../../../blogs/dto/buy-request.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { StripeService } from '../stripe.service';

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

      // const clientReferenceId: string = currentUserDto.userId ;

      const clientReferenceId: string = 'test-user-id';

      const stripe = await this.stripeService.createStripeInstance('test');
      const successUrl = await this.stripeService.getStripeUrls('success');
      const cancelUrl = await this.stripeService.getStripeUrls('cancel');

      const session = await stripe.checkout.sessions.create({
        success_url: successUrl,
        cancel_url: cancelUrl,
        line_items: buyRequest.products.map((product) => ({
          price_data: {
            product_data: {
              name: 'Product: ' + product.productId,
              description: 'Product description',
            },
            unit_amount: 10 * 100,
            currency: 'USD',
          },
          quantity: product.quantity,
        })),
        mode: 'payment',
        client_reference_id: clientReferenceId,
      });

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
      return session;
    } catch (error) {
      // Handle errors
      throw new InternalServerErrorException(error.message);
    }
  }
}
