import { Injectable } from '@nestjs/common';
import { PairAndQuestionsDto } from '../dto/pair-questions.dto';
import { GameModel, PlayerModel, QuestionModel } from '../models/game.model';

@Injectable()
export class MapPairGame {
  async toGameModel(
    pairAndQuestionsDto: PairAndQuestionsDto,
  ): Promise<GameModel> {
    const { pair } = pairAndQuestionsDto;
    const { challengeQuestions } = pairAndQuestionsDto;

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
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: secondPlayer,
        score: 0,
      },
      questions: questions,
      status: pair.status,
      pairCreatedDate: pair.pairCreatedDate || '',
      startGameDate: pair.startGameDate || '',
      finishGameDate: pair.finishGameDate || '',
    };
  }
}
