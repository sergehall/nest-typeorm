import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartGameCommand } from './start-game.use-case';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { GameViewModel } from '../../models/game.view-model';
import { ForbiddenException } from '@nestjs/common';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { PairQuestionsScoreDto } from '../../dto/pair-questions-score.dto';

export class MyCurrentGameCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(MyCurrentGameCommand)
export class MyCurrentGameUseCase
  implements ICommandHandler<MyCurrentGameCommand>
{
  constructor(
    protected gameQuizRepo: GameQuizRepo,
    protected mapPairGame: MapPairGame,
  ) {}
  async execute(command: StartGameCommand): Promise<GameViewModel> {
    const { currentUserDto } = command;

    const pairByUserId: PairQuestionsScoreDto | null =
      await this.gameQuizRepo.getCurrentGame(currentUserDto);

    if (!pairByUserId) {
      throw new ForbiddenException('The user has no open, unfinished games.');
    }

    return await this.mapPairGame.toGameModel(pairByUserId);
  }
}
