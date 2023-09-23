import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { GameModel } from '../../models/game.model';
import { PairQuestionsDto } from '../../dto/pair-questions.dto';
import { ForbiddenException } from '@nestjs/common';
import { PairsGameQuizEntity } from '../../entities/pairs-game-quiz.entity';

export class StartGameCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(StartGameCommand)
export class StartGameUseCase implements ICommandHandler<StartGameCommand> {
  constructor(protected gameQuizRepo: GameQuizRepo) {}
  async execute(command: StartGameCommand): Promise<GameModel> {
    const { currentUserDto } = command;

    const isExistPair: PairsGameQuizEntity | null =
      await this.gameQuizRepo.isExistPair(currentUserDto.userId);

    await this.checkPermission(isExistPair);

    const pairAndQuestionsDto: PairQuestionsDto =
      await this.gameQuizRepo.getOrCreatePairGame(currentUserDto);

    return await this.mapPairGameQuizEntityToGameModel(pairAndQuestionsDto);
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

  private async checkPermission(
    isExistPair: PairsGameQuizEntity | null,
  ): Promise<void> {
    if (isExistPair) {
      throw new ForbiddenException(
        'The current player is already involved in an ongoing active game pairing.',
      );
    }
  }
}
