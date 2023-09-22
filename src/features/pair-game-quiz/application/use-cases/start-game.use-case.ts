import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { GameModel } from '../../models/game.model';
import { PairQuestionsDto } from '../../dto/pair-questions.dto';

export class StartGameCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(StartGameCommand)
export class StartGameUseCase implements ICommandHandler<StartGameCommand> {
  constructor(protected gameQuizRepo: GameQuizRepo) {}
  async execute(command: StartGameCommand): Promise<GameModel> {
    const { currentUserDto } = command;

    const pairQuestionsDto: PairQuestionsDto =
      await this.gameQuizRepo.getOrCreatePairGame(currentUserDto);

    return await this.mapPairGameQuizEntityToGameModel(pairQuestionsDto);
  }

  private async mapPairGameQuizEntityToGameModel(
    pairQuestionsDto: PairQuestionsDto,
  ): Promise<GameModel> {
    const { pair } = pairQuestionsDto;
    const { challengeQuestions } = pairQuestionsDto;

    const secondPlayer = pair.secondPlayer?.userId
      ? {
          id: pair.secondPlayer.userId,
          login: pair.secondPlayer.login,
        }
      : null;

    // console.log(pair, 'pair');
    // console.log(challengeQuestions, 'challengeQuestions');
    const questions =
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
