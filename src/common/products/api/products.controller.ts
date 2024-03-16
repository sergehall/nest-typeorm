import { SkipThrottle } from '@nestjs/throttler';
import { Controller, Get, Query } from '@nestjs/common';
import { PaginatorDto } from '../../helpers/paginator.dto';
import { ParseQueriesDto } from '../../query/dto/parse-queries.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ParseQueriesService } from '../../query/parse-queries.service';
import { CreateAndSaveTestArrProductsCommand } from '../application/create-and-save-test-arr-products.use-case';

@SkipThrottle()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly parseQueriesService: ParseQueriesService,
    private readonly commandBus: CommandBus,
  ) {}
  @Get('/test-arr')
  async getBlogsOwnedByCurrentUser(@Query() query: any): Promise<PaginatorDto> {
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    const countProducts = queryData.countProducts;

    return await this.commandBus.execute(
      new CreateAndSaveTestArrProductsCommand(countProducts),
    );
  }
}
