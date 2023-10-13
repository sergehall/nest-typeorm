import { Injectable } from '@nestjs/common';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { CountCorrectAnswerDto } from '../dto/correct-answer-counts-and-bonus.dto';
import { AnswerStatusEnum } from '../enums/answer-status.enum';
import { GameQuestionsRepo } from '../infrastructure/game-questions.repo';
import { PairsGameEntity } from '../entities/pairs-game.entity';

@Injectable()
export class PairGameQuizService {
  constructor(protected gameQuestionsRepo: GameQuestionsRepo) {}

  async createAndSaveQuestion(): Promise<boolean> {
    return await this.gameQuestionsRepo.createAndSaveQuestion();
  }

  async getScores(
    game: PairsGameEntity,
    challengeAnswers: ChallengeAnswersEntity[],
  ): Promise<CountCorrectAnswerDto> {
    const firstPlayerUserId = game.firstPlayer.userId;

    const counts = challengeAnswers.reduce(
      (counts, answer) => {
        if (answer.answerStatus === AnswerStatusEnum.CORRECT) {
          if (answer.answerOwner.userId === firstPlayerUserId) {
            counts.firstPlayerCountCorrectAnswer++;
          } else {
            counts.secondPlayerCountCorrectAnswer++;
          }
        }
        return counts;
      },

      { firstPlayerCountCorrectAnswer: 0, secondPlayerCountCorrectAnswer: 0 },
    );

    // add bonusPoint
    if (challengeAnswers.length === 10) {
      await this.addBonusPoint(challengeAnswers, firstPlayerUserId, counts);
    }

    return counts;
  }

  private async addBonusPoint(
    challengeAnswers: ChallengeAnswersEntity[],
    firstPlayerId: string,
    counts: CountCorrectAnswerDto,
  ): Promise<CountCorrectAnswerDto> {
    const lastAnswerOwnerUserId: string =
      challengeAnswers[challengeAnswers.length - 1].answerOwner.userId;

    for (let i = challengeAnswers.length - 1; i >= 0; i--) {
      const currentAnswer: ChallengeAnswersEntity = challengeAnswers[i];
      if (
        currentAnswer.answerStatus === AnswerStatusEnum.CORRECT &&
        currentAnswer.answerOwner.userId !== lastAnswerOwnerUserId
      ) {
        if (currentAnswer.answerOwner.userId === firstPlayerId) {
          counts.firstPlayerCountCorrectAnswer++;
        } else {
          counts.secondPlayerCountCorrectAnswer++;
        }
        break;
      }
    }
    return counts;
  }
}
