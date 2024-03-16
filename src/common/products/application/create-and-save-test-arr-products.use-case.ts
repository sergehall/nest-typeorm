import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ProductsDataEntity } from '../entities/products-data.entity';
import { CreateRandomProductCommand } from './create-random-products.use-case';
import { ProductsRepo } from '../infrastructure/products.repo';

export class CreateAndSaveTestArrProductsCommand {
  constructor(public countProducts: number) {}
}

@Injectable()
@CommandHandler(CreateAndSaveTestArrProductsCommand)
export class CreateAndSaveTestArrProductsUseCase
  implements ICommandHandler<CreateAndSaveTestArrProductsCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly productsRepo: ProductsRepo,
  ) {}

  async execute(
    command: CreateAndSaveTestArrProductsCommand,
  ): Promise<ProductsDataEntity[]> {
    const { countProducts } = command;
    const randomProducts = await this.commandBus.execute(
      new CreateRandomProductCommand(countProducts),
    );
    console.log(
      `An array of ${countProducts} products has been successfully created.`,
    );
    return await this.productsRepo.saveTestArrProducts(randomProducts);
  }
}
