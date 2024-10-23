

import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { GameSummaryViewModel } from '../../views/game-summary.view-model';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';
import { GamesResultsEnum } from '../../enums/games-results.enum';

export class MyGamesStatisticCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(MyGamesStatisticCommand)
export class MyGamesStatisticUseCase
  implements ICommandHandler<MyGamesStatisticCommand>
{
  constructor(protected pairsGameRepo: GamePairsRepo) {}

  async execute(
    command: MyGamesStatisticCommand,
  ): Promise<GameSummaryViewModel> {
    const { currentUserDto } = command;
    const { userId } = currentUserDto;

    const allGames: PairsGameEntity[] =
      await this.pairsGameRepo.getAllGamesByUserId(userId);

    return await this.calculateUserGameStats(allGames, userId);
  }

  private async calculateUserGameStats(
    arrayGames: PairsGameEntity[],
    userId: string,
  ): Promise<GameSummaryViewModel> {
    let sumScore = 0;
    let gamesCount = 0;
    let winsCount = 0;
    let lossesCount = 0;
    let drawsCount = 0;

    for (const game of arrayGames) {
      const isUserFirstPlayer = game.firstPlayer.userId === userId;
      const isUserSecondPlayer = game.secondPlayer!.userId === userId;

      if (isUserFirstPlayer || isUserSecondPlayer) {
        gamesCount++;
        const currentUserScore = isUserFirstPlayer
          ? game.firstPlayerScore
          : game.secondPlayerScore;

        sumScore += currentUserScore;

        const gameResult = isUserFirstPlayer
          ? game.firstPlayerGameResult
          : game.secondPlayerGameResult;

        if (gameResult === GamesResultsEnum.WON) {
          winsCount++;
        } else if (gameResult === GamesResultsEnum.LOST) {
          lossesCount++;
        } else {
          drawsCount++;
        }
      }
    }

    const avgScores = gamesCount > 0 ? +(sumScore / gamesCount).toFixed(2) : 0;

    return {
      sumScore,
      avgScores,
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount,
    };
  }
}
