import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartGameCommand } from './start-game.use-case';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { GameModel } from '../../models/game.model';
import { NotFoundException } from '@nestjs/common';
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
  async execute(command: StartGameCommand): Promise<GameModel> {
    const { currentUserDto } = command;

    const pairAndQuestionsByUserId: PairQuestionsScoreDto | null =
      await this.gameQuizRepo.getGameAndQuestionsForUser(currentUserDto);

    if (!pairAndQuestionsByUserId)
      throw new NotFoundException(
        `Game with fot user ID ${currentUserDto.userId} not found`,
      );

    return await this.mapPairGame.toGameModel(pairAndQuestionsByUserId);
  }
}
