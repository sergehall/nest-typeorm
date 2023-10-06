import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { GameViewModel } from '../../models/game.view-model';
import { ForbiddenException } from '@nestjs/common';
import { PairsGameQuizEntity } from '../../entities/pairs-game-quiz.entity';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { PairQuestionsAnswersScoresDto } from '../../dto/pair-questions-score.dto';
import { StatusGameEnum } from '../../enums/status-game.enum';

export class StartGameCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(StartGameCommand)
export class StartGameUseCase implements ICommandHandler<StartGameCommand> {
  constructor(
    protected gameQuizRepo: GameQuizRepo,
    protected mapPairGame: MapPairGame,
  ) {}
  async execute(command: StartGameCommand): Promise<GameViewModel> {
    const { currentUserDto } = command;

    const gameByUserId: PairsGameQuizEntity | null =
      await this.gameQuizRepo.getUnfinishedGameByUserId(currentUserDto.userId);

    await this.checkPermission(gameByUserId);

    const pairQuestionsScoreDto: PairQuestionsAnswersScoresDto =
      await this.gameQuizRepo.getPendingPairOrCreateNew(currentUserDto);

    return await this.mapPairGame.toGameModel(pairQuestionsScoreDto);
  }

  private async checkPermission(
    gameByUserId: PairsGameQuizEntity | null,
  ): Promise<void> {
    if (gameByUserId && gameByUserId.status !== StatusGameEnum.FINISHED) {
      throw new ForbiddenException(
        'The current player is already involved in an ongoing active game pairing.',
      );
    }
  }
}
