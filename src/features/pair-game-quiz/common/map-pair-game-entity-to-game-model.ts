import { Injectable } from '@nestjs/common';
import {
  AnswerModel,
  GameViewModel,
  PlayerModel,
  QuestionModel,
} from '../models/game.view-model';
import { PairQuestionsAnswersScoresDto } from '../dto/pair-questions-score.dto';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Injectable()
export class MapPairGame {
  async toGameModel(
    pairQuestionsAnswersScoresDto: PairQuestionsAnswersScoresDto,
  ): Promise<GameViewModel> {
    const { pair, challengeQuestions, challengeAnswers, scores } =
      pairQuestionsAnswersScoresDto;

    const secondPlayer: PlayerModel | null = pair.secondPlayer?.userId
      ? {
          id: pair.secondPlayer.userId,
          login: pair.secondPlayer.login,
        }
      : null;

    const questions: QuestionModel[] = await this.processQuestions(
      challengeQuestions,
    );

    const processAnswers = await this.processAnswers(
      pair.firstPlayer,
      pair.secondPlayer,
      challengeAnswers,
    );

    const firstPlayerAnswers: AnswerModel[] =
      processAnswers.get(pair.firstPlayer.userId) ?? [];

    let secondPlayerAnswers: AnswerModel[] = [];
    if (secondPlayer) {
      secondPlayerAnswers = processAnswers.get(secondPlayer.id) ?? [];
    }

    return {
      id: pair.id,
      firstPlayerProgress: {
        answers: firstPlayerAnswers,
        player: {
          id: pair.firstPlayer.userId,
          login: pair.firstPlayer.login,
        },
        score: scores.currentUserCorrectAnswerCount,
      },
      secondPlayerProgress: {
        answers: secondPlayerAnswers,
        player: secondPlayer,
        score: scores.competitorCorrectAnswerCount,
      },
      questions: questions,
      status: pair.status,
      pairCreatedDate: pair.pairCreatedDate,
      startGameDate: pair.startGameDate,
      finishGameDate: pair.finishGameDate,
    };
  }

  private async processQuestions(
    challengeQuestions: ChallengeQuestionsEntity[],
  ): Promise<QuestionModel[]> {
    return challengeQuestions.length > 0
      ? challengeQuestions.map((challengeQuestion) => ({
          id: challengeQuestion.id,
          body: challengeQuestion.question.questionText,
        }))
      : [];
  }

  private async processAnswers(
    firstPlayer: UsersEntity,
    secondPlayer: UsersEntity | null,
    answers: ChallengeAnswersEntity[],
  ): Promise<Map<string, AnswerModel[]>> {
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

    return answersByUser;
  }
}
