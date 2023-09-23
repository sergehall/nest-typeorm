import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { GameModel } from '../../models/game.model';
import { PairAndQuestionsDto } from '../../dto/pair-questions.dto';
import { ForbiddenException } from '@nestjs/common';
import { PairsGameQuizEntity } from '../../entities/pairs-game-quiz.entity';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';

export class StartGameCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(StartGameCommand)
export class StartGameUseCase implements ICommandHandler<StartGameCommand> {
  constructor(
    protected gameQuizRepo: GameQuizRepo,
    protected mapPairGame: MapPairGame,
  ) {}
  async execute(command: StartGameCommand): Promise<GameModel> {
    const { currentUserDto } = command;

    const isExistPair: PairsGameQuizEntity | null =
      await this.gameQuizRepo.getPairByUserId(currentUserDto.userId);

    await this.checkPermission(isExistPair);

    const pairAndQuestions: PairAndQuestionsDto =
      await this.gameQuizRepo.getPendingPairOrCreateNew(currentUserDto);

    return await this.mapPairGame.toGameModel(pairAndQuestions);
  }

  private async checkPermission(
    isExistPair: PairsGameQuizEntity | null,
  ): Promise<void> {
    if (isExistPair) {
      throw new ForbiddenException(
        'The current player is already involved in an ongoing active game pairing.',
      );
    }
  }
}
