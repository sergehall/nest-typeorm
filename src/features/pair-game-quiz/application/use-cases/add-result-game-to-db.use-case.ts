import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetGameByIdCommand } from './get-game-by-id.use-case';

export class AddResultGameToDbCommand {
  constructor(public id: string) {}
}

@CommandHandler(AddResultGameToDbCommand)
export class AddResultGameToDbUseCase
  implements ICommandHandler<AddResultGameToDbCommand>
{
  async execute(command: GetGameByIdCommand): Promise<boolean> {
    return true;
  }
}
