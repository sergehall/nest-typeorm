import { Injectable } from '@nestjs/common';
import {
  AnswerModel,
  GameViewModel,
  PlayerProgressModel,
  QuestionModel,
} from '../views/game.view-model';
import { PairQuestionsAnswersScoresDto } from '../dto/pair-questions-score.dto';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { StatusGameEnum } from '../enums/status-game.enum';
import { CountCorrectAnswerDto } from '../dto/correct-answer-counts-and-bonus.dto';
import { PairsGameEntity } from '../entities/pairs-game.entity';

@Injectable()
export class MapPairGame {
  async toGameModel(
    pairQuestionsAnswersScoresDto: PairQuestionsAnswersScoresDto,
  ): Promise<GameViewModel> {
    const { pair, challengeQuestions, challengeAnswers, scores } =
      pairQuestionsAnswersScoresDto;

    const processPlayersProgress = await this.processPlayersProgress(
      pair,
      challengeAnswers,
      scores,
    );

    let questions: QuestionModel[] | null = null;
    if (pair.status !== StatusGameEnum.PENDING) {
      questions = await this.processQuestions(challengeQuestions);
    }

    return {
      id: pair.id,
      firstPlayerProgress: processPlayersProgress.firstPlayerProgress,
      secondPlayerProgress: processPlayersProgress.secondPlayerProgress,
      questions: questions,
      status: pair.status,
      pairCreatedDate: pair.pairCreatedDate,
      startGameDate: pair.startGameDate,
      finishGameDate: pair.finishGameDate,
    };
  }

  private async processPlayersProgress(
    pair: PairsGameEntity,
    challengeAnswers: ChallengeAnswersEntity[],
    scores: CountCorrectAnswerDto,
  ): Promise<{
    firstPlayerProgress: PlayerProgressModel;
    secondPlayerProgress: PlayerProgressModel | null;
  }> {
    if (!pair.secondPlayer || pair.status === StatusGameEnum.PENDING) {
      return {
        firstPlayerProgress: {
          answers: [],
          player: {
            id: pair.firstPlayer.userId,
            login: pair.firstPlayer.login,
          },
          score: 0,
        },
        secondPlayerProgress: null,
      };
    }

    const processAnswers = await this.processAnswers(
      pair.firstPlayer,
      pair.secondPlayer,
      challengeAnswers,
    );

    return {
      firstPlayerProgress: {
        answers: processAnswers.firstPlayerAnswers,
        player: {
          id: pair.firstPlayer.userId,
          login: pair.firstPlayer.login,
        },
        score: scores.firstPlayerCountCorrectAnswer,
      },
      secondPlayerProgress: {
        answers: processAnswers.secondPlayerAnswers,
        player: {
          id: pair.secondPlayer.userId,
          login: pair.secondPlayer.login,
        },
        score: scores.secondPlayerCountCorrectAnswer,
      },
    };
  }

  private async processQuestions(
    challengeQuestions: ChallengeQuestionsEntity[],
  ): Promise<QuestionModel[]> {
    return challengeQuestions.length > 0
      ? challengeQuestions.map((challengeQuestion) => ({
          id: challengeQuestion.question.id,
          body: challengeQuestion.question.questionText,
        }))
      : [];
  }

  private async processAnswers(
    firstPlayer: UsersEntity,
    secondPlayer: UsersEntity,
    answers: ChallengeAnswersEntity[],
  ): Promise<{
    firstPlayerAnswers: AnswerModel[];
    secondPlayerAnswers: AnswerModel[];
  }> {
    // Create an object to store answers by user ID
    const answersByUser: Record<string, AnswerModel[]> = {};

    // Group answers by user ID
    answers.forEach((challengeAnswer) => {
      const userID = challengeAnswer.answerOwner.userId;
      if (!answersByUser[userID]) {
        answersByUser[userID] = [];
      }

      const formattedAnswer: AnswerModel = {
        questionId: challengeAnswer.question.id,
        answerStatus: challengeAnswer.answerStatus,
        addedAt: challengeAnswer.addedAt,
      };

      answersByUser[userID].push(formattedAnswer);
    });

    // Process each user's answers concurrently
    const processingPromises = Object.keys(answersByUser).map(
      async (userID) => {
        // You can perform additional processing here if needed
        return userID;
      },
    );

    // Wait for all processing to complete
    await Promise.all(processingPromises);

    // Retrieve processed answers for firstPlayer and secondPlayer (if provided)
    const firstPlayerAnswers = answersByUser[firstPlayer.userId] || [];
    const secondPlayerAnswers = answersByUser[secondPlayer.userId] || [];

    return { firstPlayerAnswers, secondPlayerAnswers };
  }
}
