import { Injectable } from '@nestjs/common';
import { GameModel, PlayerModel, QuestionModel } from '../models/game.model';
import { PairQuestionsScoreDto } from '../dto/pair-questions-score.dto';

@Injectable()
export class MapPairGame {
  async toGameModel(
    pairQuestionsScoreDto: PairQuestionsScoreDto,
  ): Promise<GameModel> {
    const { pair, challengeQuestions, scores } = pairQuestionsScoreDto;

    const secondPlayer: PlayerModel | null = pair.secondPlayer?.userId
      ? {
          id: pair.secondPlayer.userId,
          login: pair.secondPlayer.login,
        }
      : null;

    const questions: QuestionModel[] | [] =
      challengeQuestions.length > 0
        ? challengeQuestions.map((challengeQuestion) => ({
            id: challengeQuestion.id,
            body: challengeQuestion.question.questionText,
          }))
        : [];

    return {
      id: pair.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: pair.firstPlayer.userId,
          login: pair.firstPlayer.login,
        },
        score: scores.currentUserCorrectAnswerCount,
      },
      secondPlayerProgress: {
        answers: [],
        player: secondPlayer,
        score: scores.competitorCorrectAnswerCount,
      },
      questions: questions,
      status: pair.status,
      pairCreatedDate: pair.pairCreatedDate || '',
      startGameDate: pair.startGameDate || '',
      finishGameDate: pair.finishGameDate || '',
    };
  }
}
