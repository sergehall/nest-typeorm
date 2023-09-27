import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { GameViewModel } from '../../models/game.view-model';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { PairsGameQuizEntity } from '../../entities/pairs-game-quiz.entity';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PairQuestionsScoreDto } from '../../dto/pair-questions-score.dto';

export class GetGameByIdCommand {
  constructor(public id: string, public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(GetGameByIdCommand)
export class GetGameByIdUseCase implements ICommandHandler<GetGameByIdCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected gameQuizRepo: GameQuizRepo,
    protected mapPairGame: MapPairGame,
  ) {}
  async execute(command: GetGameByIdCommand): Promise<GameViewModel> {
    const { id, currentUserDto } = command;

    const gameById: PairsGameQuizEntity | null =
      await this.gameQuizRepo.getGameByPairId(id);

    if (!gameById) throw new NotFoundException(`Game with ID ${id} not found`);

    await this.checkPermission(gameById, currentUserDto);

    const gameAndQuestions: PairQuestionsScoreDto =
      await this.gameQuizRepo.getNextQuestionsToGame(gameById, currentUserDto);

    return await this.mapPairGame.toGameModel(gameAndQuestions);
  }

  private async checkPermission(
    game: PairsGameQuizEntity,
    currentUserDto: CurrentUserDto,
  ) {
    let abilityId = 'invalidId';
    if (game.firstPlayer.userId === currentUserDto.userId) {
      abilityId = game.firstPlayer.userId;
    } else if (
      game.secondPlayer &&
      game.secondPlayer.userId === currentUserDto.userId
    ) {
      abilityId = game.secondPlayer.userId;
    }

    const abilityPlayer = this.caslAbilityFactory.createForUserId({
      id: abilityId,
    });

    try {
      ForbiddenError.from(abilityPlayer).throwUnlessCan(Action.UPDATE, {
        id: currentUserDto.userId,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(
          'You do not have permission to get this game. ' + error.message,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
