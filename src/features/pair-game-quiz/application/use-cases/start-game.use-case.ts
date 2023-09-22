import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';

export class StartGameCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(StartGameCommand)
export class StartGameUseCase implements ICommandHandler<StartGameCommand> {
  constructor(protected gameQuizRepo: GameQuizRepo) {}
  async execute(command: StartGameCommand) {
    const { currentUserDto } = command;

    const game = await this.gameQuizRepo.getOrCreatePairGame(currentUserDto);
    console.log(game, 'game');
    return true;
  }
}
