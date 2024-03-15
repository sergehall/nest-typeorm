import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { BuyRequestDto } from '../../blogs/dto/buy-request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { BuyProductsCommand } from '../application/use-cases/buy-products.use-case';

@Controller('stripe')
export class StripeController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/buy')
  // @UseGuards(JwtAuthGuard)
  async buy(
    @Body() buyRequest: BuyRequestDto,
    @Request() req: any,
  ): Promise<string> {
    const currentUserDto: CurrentUserDto = req.user;
    return this.commandBus.execute(
      new BuyProductsCommand(buyRequest, currentUserDto),
    );
  }

  @Post('webhook')
  async stripeWebhook(@Body() payload: any) {
    console.log(JSON.stringify(payload), 'stripeWebhook');
    // return await this.commandBus.execute(
    //   new ProcessStripeCommand(payload),
    // );
    return true;
  }

  @Get('/success')
  async success(): Promise<string> {
    return 'The purchase was successfully completed';
  }

  @Get('cancel')
  async cancel(): Promise<string> {
    return 'The purchase was canceled';
  }
}
