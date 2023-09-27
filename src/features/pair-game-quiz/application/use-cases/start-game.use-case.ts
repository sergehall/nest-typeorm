import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { GameViewModel } from '../../models/game.view-model';
import { ForbiddenException } from '@nestjs/common';
import { PairsGameQuizEntity } from '../../entities/pairs-game-quiz.entity';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { PairQuestionsScoreDto } from '../../dto/pair-questions-score.dto';

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

    const game: PairsGameQuizEntity | null =
      await this.gameQuizRepo.getGameByUserId(currentUserDto.userId);

    await this.checkPermission(game);

    const pairQuestionsScoreDto: PairQuestionsScoreDto =
      await this.gameQuizRepo.getPendingPairOrCreateNew(currentUserDto);

    return await this.mapPairGame.toGameModel(pairQuestionsScoreDto);
  }

  private async checkPermission(
    game: PairsGameQuizEntity | null,
  ): Promise<void> {
    if (game) {
      throw new ForbiddenException(
        'The current player is already involved in an ongoing active game pairing.',
      );
    }
  }
}
