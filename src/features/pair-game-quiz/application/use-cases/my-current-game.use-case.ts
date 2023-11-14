import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartGameCommand } from './start-game.use-case';
import { GameViewModel } from '../../views/game.view-model';
import { NotFoundException } from '@nestjs/common';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { StatusGameEnum } from '../../enums/status-game.enum';
import { ChallengeQuestionsEntity } from '../../entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { CountCorrectAnswerDto } from '../../dto/correct-answer-counts-and-bonus.dto';
import { PairGameQuizService } from '../pair-game-quiz.service';
import { ChallengesQuestionsRepo } from '../../infrastructure/challenges-questions.repo';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers.repo';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';

export class MyCurrentGameCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(MyCurrentGameCommand)
export class MyCurrentGameUseCase
  implements ICommandHandler<MyCurrentGameCommand>
{
  constructor(
    protected pairsGameRepo: GamePairsRepo,
    protected mapPairGame: MapPairGame,
    protected pairGameQuizService: PairGameQuizService,
    protected challengesQuestionsRepo: ChallengesQuestionsRepo,
    protected challengesAnswersRepo: ChallengesAnswersRepo,
  ) {}
  async execute(command: StartGameCommand): Promise<GameViewModel> {
    const { currentUserDto } = command;

    const game: PairsGameEntity | null =
      await this.pairsGameRepo.getUnfinishedGameByUserId(currentUserDto.userId);

    if (!game) {
      throw new NotFoundException(
        `Active game for user ID ${currentUserDto.userId} not found.`,
      );
    }

    if (game.status === StatusGameEnum.PENDING) {
      return this.createGameModelForPending(game);
    }

    return this.createGameModelForActive(game);
  }

  private createGameModelForPending(
    game: PairsGameEntity,
  ): Promise<GameViewModel> {
    const challengeQuestions: ChallengeQuestionsEntity[] = [];
    const challengeAnswers: ChallengeAnswersEntity[] = [];

    return this.mapPairGame.toGameModel({
      pair: game,
      challengeQuestions,
      challengeAnswers,
      scores: {
        firstPlayerCountCorrectAnswer: 0,
        secondPlayerCountCorrectAnswer: 0,
      },
    });
  }

  private async createGameModelForActive(
    game: PairsGameEntity,
  ): Promise<GameViewModel> {
    const challengeAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getChallengeAnswersByGameId(game.id);

    const currentScores: CountCorrectAnswerDto =
      await this.pairGameQuizService.getScores(game, challengeAnswers);

    const challengeQuestions: ChallengeQuestionsEntity[] =
      await this.challengesQuestionsRepo.getChallengeQuestionsByGameId(game.id);

    return this.mapPairGame.toGameModel({
      pair: game,
      challengeQuestions,
      challengeAnswers: challengeAnswers,
      scores: currentScores,
    });
  }
}
