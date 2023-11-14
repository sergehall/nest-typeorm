import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameViewModel } from '../../views/game.view-model';
import { ForbiddenException } from '@nestjs/common';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { PairQuestionsAnswersScoresDto } from '../../dto/pair-questions-score.dto';
import { StatusGameEnum } from '../../enums/status-game.enum';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';

export class StartGameCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(StartGameCommand)
export class StartGameUseCase implements ICommandHandler<StartGameCommand> {
  constructor(
    protected gameQuizRepo: GamePairsRepo,
    protected mapPairGame: MapPairGame,
  ) {}
  async execute(command: StartGameCommand): Promise<GameViewModel> {
    const { currentUserDto } = command;

    const gameByUserId: PairsGameEntity | null =
      await this.gameQuizRepo.getUnfinishedGameByUserId(currentUserDto.userId);

    await this.checkPermission(gameByUserId);

    const pairQuestionsScoreDto: PairQuestionsAnswersScoresDto =
      await this.gameQuizRepo.getPendingPairOrCreateNew(currentUserDto);

    return await this.mapPairGame.toGameModel(pairQuestionsScoreDto);
  }

  private async checkPermission(
    gameByUserId: PairsGameEntity | null,
  ): Promise<void> {
    if (gameByUserId && gameByUserId.status !== StatusGameEnum.FINISHED) {
      throw new ForbiddenException(
        'The current player is already involved in an ongoing active game pairing.',
      );
    }
  }
}
