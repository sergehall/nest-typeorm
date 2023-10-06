import { Injectable } from '@nestjs/common';
import {
  AnswerModel,
  GameViewModel,
  PlayerProgressModel,
  QuestionModel,
} from '../models/game.view-model';
import { PairQuestionsAnswersScoresDto } from '../dto/pair-questions-score.dto';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { StatusGameEnum } from '../enums/status-game.enum';
import { PairsGameQuizEntity } from '../entities/pairs-game-quiz.entity';
import { CorrectAnswerCountsAndBonusDto } from '../dto/correct-answer-counts-and-bonus.dto';

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
    pair: PairsGameQuizEntity,
    challengeAnswers: ChallengeAnswersEntity[],
    scores: CorrectAnswerCountsAndBonusDto,
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
    const usersIds = [];
    usersIds.push(firstPlayer.userId);
    if (secondPlayer) {
      usersIds.push(secondPlayer.userId);
    }

    const answersByUser = new Map<string, AnswerModel[]>();

    // Initialize the map with empty arrays for each user ID
    usersIds.forEach((userID) => {
      answersByUser.set(userID, []);
    });

    // Group answers by user ID
    for (const challengeAnswer of answers) {
      const userID = challengeAnswer.answerOwner.userId;
      // Use type assertion to indicate that the value is not undefined
      const userAnswers = answersByUser.get(userID)!;

      const formattedAnswer: AnswerModel = {
        questionId: challengeAnswer.question.id,
        answerStatus: challengeAnswer.answerStatus,
        addedAt: challengeAnswer.addedAt,
      };

      userAnswers.push(formattedAnswer);
    }

    // Process each user's answers concurrently
    const processingPromises = usersIds.map(async (userID) => {
      const formattedAnswers = answersByUser.get(userID)!;
      answersByUser.set(userID, formattedAnswers);
    });

    // Wait for all processing to complete
    await Promise.all(processingPromises);

    const firstPlayerAnswers: AnswerModel[] =
      answersByUser.get(firstPlayer.userId) ?? [];
    const secondPlayerAnswers: AnswerModel[] =
      answersByUser.get(secondPlayer.userId) ?? [];

    return { firstPlayerAnswers, secondPlayerAnswers };
  }
}
