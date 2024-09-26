import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameViewModel } from '../../views/game.view-model';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PairGameQuizService } from '../pair-game-quiz.service';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { CountCorrectAnswerDto } from '../../dto/correct-answer-counts-and-bonus.dto';
import { ChallengeQuestionsEntity } from '../../entities/challenge-questions.entity';
import { ChallengesQuestionsRepo } from '../../infrastructure/challenges-questions.repo';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers.repo';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';

export class GetGameByIdCommand {
  constructor(
    public id: string,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(GetGameByIdCommand)
export class GetGameByIdUseCase implements ICommandHandler<GetGameByIdCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected pairGameQuizService: PairGameQuizService,
    protected challengesQuestionsRepo: ChallengesQuestionsRepo,
    protected challengesAnswersRepo: ChallengesAnswersRepo,
    protected pairsGameRepo: GamePairsRepo,
    protected mapPairGame: MapPairGame,
  ) {}
  async execute(command: GetGameByIdCommand): Promise<GameViewModel> {
    const { id, currentUserDto } = command;

    const pairByGameId: PairsGameEntity | null =
      await this.pairsGameRepo.getGameByPairId(id);

    if (!pairByGameId)
      throw new NotFoundException(`Pair game with ID ${id} not found`);

    await this.checkPermission(pairByGameId, currentUserDto);

    return this.createGameModel(pairByGameId);
  }

  private async createGameModel(game: PairsGameEntity): Promise<GameViewModel> {
    const challengeQuestions: ChallengeQuestionsEntity[] =
      await this.challengesQuestionsRepo.getChallengeQuestionsByGameId(game.id);

    const challengeAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getChallengeAnswersByGameId(game.id);

    const currentScores: CountCorrectAnswerDto =
      await this.pairGameQuizService.getScores(game, challengeAnswers);

    return this.mapPairGame.toGameModel({
      pair: game,
      challengeQuestions,
      challengeAnswers: challengeAnswers,
      scores: currentScores,
    });
  }

  private async checkPermission(
    game: PairsGameEntity,
    currentUserDto: CurrentUserDto,
  ) {
    let abilityId: string | undefined = 'invalidId';

    if (game.firstPlayer.userId === currentUserDto.userId) {
      abilityId = game.firstPlayer.userId;
    } else if (game.secondPlayer?.userId === currentUserDto.userId) {
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
