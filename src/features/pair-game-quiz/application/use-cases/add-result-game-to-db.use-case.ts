import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PairsGameQuizEntity } from '../../entities/pairs-game-quiz.entity';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { PairGameQuizService } from '../pair-game-quiz.service';
import { CountCorrectAnswerDto } from '../../dto/correct-answer-counts-and-bonus.dto';
import { GamesResultsEntity } from '../../entities/games-results.entity';
import { GamesResultsEnum } from '../../enums/games-results.enum';
import { UsersEntity } from '../../../users/entities/users.entity';
import { PlayersResultDto } from '../../dto/players-result.dto';

export class AddResultGameToDbCommand {
  constructor(public game: PairsGameQuizEntity) {}
}

@CommandHandler(AddResultGameToDbCommand)
export class AddResultGameToDbUseCase
  implements ICommandHandler<AddResultGameToDbCommand>
{
  constructor(
    protected gameQuizRepo: GameQuizRepo,
    protected pairGameQuizService: PairGameQuizService,
  ) {}

  async execute(command: AddResultGameToDbCommand): Promise<boolean> {
    const { game } = command;

    const challengeAnswers: ChallengeAnswersEntity[] =
      await this.gameQuizRepo.getChallengeAnswersByGameId(game.id);

    const scores: CountCorrectAnswerDto =
      await this.pairGameQuizService.getScores(game, challengeAnswers);

    const gameResult = await this.gameResult(scores);
    const firstPlayer = {
      player: game.firstPlayer,
      sumScore: scores.firstPlayerCountCorrectAnswer,
      gameResult: gameResult.firstPlayer,
    };
    const secondPlayer = {
      player: game.secondPlayer ? game.secondPlayer : new UsersEntity(),
      sumScore: scores.secondPlayerCountCorrectAnswer,
      gameResult: gameResult.secondPlayer,
    };
    const gameResultEntities = await this.createGameResultEntities(game, [
      firstPlayer,
      secondPlayer,
    ]);
    await this.gameQuizRepo.createGamesResults(gameResultEntities);
    return true;
  }

  private async createGameResultEntities(
    game: PairsGameQuizEntity,
    playersArr: PlayersResultDto[],
  ): Promise<Array<GamesResultsEntity>> {
    const gameResultEntities: Array<GamesResultsEntity> = [];

    for (const playerData of playersArr) {
      const { player, sumScore, gameResult } = playerData;

      const gameResultEntity = new GamesResultsEntity();
      gameResultEntity.sumScore = sumScore;
      gameResultEntity.gameResult = gameResult;

      const pairGameQuizEntity = new PairsGameQuizEntity();
      pairGameQuizEntity.id = game.id;

      // Set relationships
      gameResultEntity.pairGameQuiz = pairGameQuizEntity;
      gameResultEntity.player = player;

      gameResultEntities.push(gameResultEntity);
    }

    return gameResultEntities;
  }

  private async gameResult(scores: CountCorrectAnswerDto): Promise<{
    firstPlayer: GamesResultsEnum;
    secondPlayer: GamesResultsEnum;
  }> {
    const { firstPlayerCountCorrectAnswer, secondPlayerCountCorrectAnswer } =
      scores;

    return {
      firstPlayer:
        firstPlayerCountCorrectAnswer === secondPlayerCountCorrectAnswer
          ? GamesResultsEnum.DRAW
          : firstPlayerCountCorrectAnswer > secondPlayerCountCorrectAnswer
          ? GamesResultsEnum.WON
          : GamesResultsEnum.LOST,
      secondPlayer:
        firstPlayerCountCorrectAnswer === secondPlayerCountCorrectAnswer
          ? GamesResultsEnum.DRAW
          : firstPlayerCountCorrectAnswer > secondPlayerCountCorrectAnswer
          ? GamesResultsEnum.LOST
          : GamesResultsEnum.WON,
    };
  }
}
