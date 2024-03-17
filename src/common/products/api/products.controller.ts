import { SkipThrottle } from '@nestjs/throttler';
import { Controller, Get, Query } from '@nestjs/common';
import { ParseQueriesDto } from '../../query/dto/parse-queries.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ParseQueriesService } from '../../query/parse-queries.service';
import { CreateAndSaveCreateRandomProductsCommand } from '../application/create-and-save-create-random-products.use-case';

@SkipThrottle()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly parseQueriesService: ParseQueriesService,
    private readonly commandBus: CommandBus,
  ) {}
  @Get('/test-products')
  async getBlogsOwnedByCurrentUser(@Query() query: any): Promise<string> {
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    const countProducts: number = queryData.countProducts;

    return await this.commandBus.execute(
      new CreateAndSaveCreateRandomProductsCommand(countProducts),
    );
  }
}
