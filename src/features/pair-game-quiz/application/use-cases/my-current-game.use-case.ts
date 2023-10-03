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
import { CorrectAnswerCountsAndBonusDto } from '../../dto/correct-answer-counts-and-bonus.dto';
import { AnswerStatusEnum } from '../../enums/answer-status.enum';

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
        currentUserCorrectAnswerCount: 0,
        competitorCorrectAnswerCount: 0,
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

    const currentScores: CorrectAnswerCountsAndBonusDto = await this.getScores(
      game,
      challengeAnswersCount.challengeAnswers,
    );

    const challengeQuestions: ChallengeQuestionsEntity[] =
      await this.gameQuizRepo.getChallengeQuestions(
        game.id,
        challengeAnswersCount.countAnswersByUserId,
      );

    return this.mapPairGame.toGameModel({
      pair: game,
      challengeQuestions,
      challengeAnswers: challengeAnswersCount.challengeAnswers,
      scores: currentScores,
    });
  }

  private async getScores(
    game: PairsGameQuizEntity,
    challengeAnswers: ChallengeAnswersEntity[],
  ): Promise<CorrectAnswerCountsAndBonusDto> {
    let bonusPoint = true;
    return challengeAnswers.reduce(
      (counts, answer) => {
        if (answer.answerStatus === AnswerStatusEnum.CORRECT) {
          if (answer.answerOwner.userId === game.firstPlayer.userId) {
            if (bonusPoint) {
              counts.currentUserCorrectAnswerCount++;
              bonusPoint = false;
            }
            counts.currentUserCorrectAnswerCount++;
          } else {
            if (bonusPoint) {
              counts.competitorCorrectAnswerCount++;
              bonusPoint = false;
            }
            counts.competitorCorrectAnswerCount++;
          }
        }
        return counts;
      },
      { currentUserCorrectAnswerCount: 0, competitorCorrectAnswerCount: 0 },
    );
  }
}
