import { Injectable } from '@nestjs/common';
import { GameQuizRepo } from '../infrastructure/game-quiz-repo';
import { PairsGameQuizEntity } from '../entities/pairs-game-quiz.entity';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { CountCorrectAnswerDto } from '../dto/correct-answer-counts-and-bonus.dto';
import { AnswerStatusEnum } from '../enums/answer-status.enum';

@Injectable()
export class PairGameQuizService {
  constructor(protected gameQuizRepo: GameQuizRepo) {}

  async createAndSaveQuestion(): Promise<boolean> {
    return await this.gameQuizRepo.createAndSaveQuestion();
  }

  async getScores(
    game: PairsGameQuizEntity,
    challengeAnswers: ChallengeAnswersEntity[],
  ): Promise<CountCorrectAnswerDto> {
    const counts = challengeAnswers.reduce(
      (counts, answer) => {
        if (answer.answerStatus === AnswerStatusEnum.CORRECT) {
          if (answer.answerOwner.userId === game.firstPlayer.userId) {
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
      await this.findFirstCorrectAnswerFromPenultimate(
        challengeAnswers,
        game.firstPlayer.userId,
        counts,
      );
      // if (challengeAnswers[8].answerStatus === AnswerStatusEnum.CORRECT) {
      //   if (
      //     challengeAnswers[8].answerOwner.userId === game.firstPlayer.userId
      //   ) {
      //     counts.firstPlayerCountCorrectAnswer++;
      //   } else {
      //     counts.secondPlayerCountCorrectAnswer++;
      //   }
      // }
    }

    return counts;
  }

  private async findFirstCorrectAnswerFromPenultimate(
    challengeAnswers: ChallengeAnswersEntity[],
    firstPlayerId: string,
    counts: CountCorrectAnswerDto,
  ): Promise<CountCorrectAnswerDto> {
    for (let i = challengeAnswers.length - 2; i >= 0; i--) {
      if (challengeAnswers[i].answerStatus === AnswerStatusEnum.CORRECT) {
        if (challengeAnswers[i].answerOwner.userId === firstPlayerId) {
          counts.firstPlayerCountCorrectAnswer++;
        } else {
          counts.secondPlayerCountCorrectAnswer++;
        }
      }
    }
    return counts;
  }
}
