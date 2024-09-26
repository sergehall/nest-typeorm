import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { PairGameQuizService } from '../pair-game-quiz.service';
import { CountCorrectAnswerDto } from '../../dto/correct-answer-counts-and-bonus.dto';
import { GamesResultsEnum } from '../../enums/games-results.enum';
import { UsersEntity } from '../../../users/entities/users.entity';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers.repo';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';

export class AddResultToPairGameCommand {
  constructor(public game: PairsGameEntity) {}
}

@CommandHandler(AddResultToPairGameCommand)
export class AddResultToPairGameUseCase
  implements ICommandHandler<AddResultToPairGameCommand>
{
  constructor(
    protected gameQuizRepo: GamePairsRepo,
    protected pairGameQuizService: PairGameQuizService,
    protected challengesAnswersRepo: ChallengesAnswersRepo,
  ) {}

  async execute(command: AddResultToPairGameCommand): Promise<boolean> {
    const { game } = command;

    const challengeAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getChallengeAnswersByGameId(game.id);

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
    await this.gameQuizRepo.saveGameResult(game, {
      firstPlayer,
      secondPlayer,
    });

    return true;
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
