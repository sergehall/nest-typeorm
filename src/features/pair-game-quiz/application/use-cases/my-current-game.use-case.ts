import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartGameCommand } from './start-game.use-case';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { GameViewModel } from '../../models/game.view-model';
import { NotFoundException } from '@nestjs/common';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { StatusGameEnum } from '../../enums/status-game.enum';
import { ChallengeQuestionsEntity } from '../../entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { PairsGameQuizEntity } from '../../entities/pairs-game-quiz.entity';
import { CountCorrectAnswerDto } from '../../dto/correct-answer-counts-and-bonus.dto';
import { AnswerStatusEnum } from '../../enums/answer-status.enum';
import { PairGameQuizService } from '../pair-game-quiz.service';

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
    protected pairGameQuizService: PairGameQuizService,
  ) {}
  async execute(command: StartGameCommand): Promise<GameViewModel> {
    const { currentUserDto } = command;

    const game: PairsGameQuizEntity | null =
      await this.gameQuizRepo.getUnfinishedGameByUserId(currentUserDto.userId);

    if (!game) {
      throw new NotFoundException(
        `Active game for user ID ${currentUserDto.userId} not found.`,
      );
    }

    if (game.status === StatusGameEnum.PENDING) {
      return this.createGameModelForPending(game);
    }

    return this.createGameModelForActive(game, currentUserDto);
  }

  private createGameModelForPending(
    game: PairsGameQuizEntity,
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
    game: PairsGameQuizEntity,
    currentUserDto: CurrentUserDto,
  ): Promise<GameViewModel> {
    const challengeAnswersCount: {
      challengeAnswers: ChallengeAnswersEntity[];
      countAnswersByUserId: number;
    } = await this.gameQuizRepo.getChallengeAnswersAndCount(
      game.id,
      currentUserDto.userId,
    );

    const currentScores: CountCorrectAnswerDto =
      await this.pairGameQuizService.getScores(
        game,
        challengeAnswersCount.challengeAnswers,
      );

    const challengeQuestions: ChallengeQuestionsEntity[] =
      await this.gameQuizRepo.getChallengeQuestionsByGameId(game.id);

    return this.mapPairGame.toGameModel({
      pair: game,
      challengeQuestions,
      challengeAnswers: challengeAnswersCount.challengeAnswers,
      scores: currentScores,
    });
  }
}
