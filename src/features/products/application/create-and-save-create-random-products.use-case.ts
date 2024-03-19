import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateRandomProductCommand } from './create-random-products.use-case';
import { ProductsRepo } from '../infrastructure/products.repo';

export class CreateAndSaveCreateRandomProductsCommand {
  constructor(public countProducts: number) {}
}

@Injectable()
@CommandHandler(CreateAndSaveCreateRandomProductsCommand)
export class CreateAndSaveCreateRandomProductsUseCase
  implements ICommandHandler<CreateAndSaveCreateRandomProductsCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly productsRepo: ProductsRepo,
  ) {}

  async execute(
    command: CreateAndSaveCreateRandomProductsCommand,
  ): Promise<string> {
    const { countProducts } = command;
    const randomProducts = await this.commandBus.execute(
      new CreateRandomProductCommand(countProducts),
    );

    await this.productsRepo.saveTestArrProducts(randomProducts);
    return `An array of ${countProducts} products has been successfully created.`;
  }
}
