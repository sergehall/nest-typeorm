import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { GamesResultsEnum } from '../../enums/games-results.enum';

export class GamesStatisticUseCase {
  constructor(protected pairsGameRepo: GamePairsRepo) {}

  async execute(): Promise<UserGameStatistics[]> {
    const allGames: PairsGameEntity[] = await this.pairsGameRepo.getAllGames();
    const userStatisticsMap = new Map<string, UserGameStatistics>();

    for (const game of allGames) {
      // Process the first player
      this.updateUserStatistics(
        userStatisticsMap,
        game.firstPlayer,
        game.firstPlayerScore,
        game.firstPlayerGameResult,
      );

      // Process the second player if it exists
      if (game.secondPlayer) {
        this.updateUserStatistics(
          userStatisticsMap,
          game.secondPlayer,
          game.secondPlayerScore,
          game.secondPlayerGameResult,
        );
      }
    }

    return Array.from(userStatisticsMap.values());
  }

  private updateUserStatistics(
    userStatisticsMap: Map<string, UserGameStatistics>,
    player: UsersEntity,
    score: number,
    gameResult: GamesResultsEnum,
  ) {
    const userId = player.userId;
    const userStats = userStatisticsMap.get(userId);

    if (!userStats) {
      userStatisticsMap.set(userId, {
        sumScore: score,
        gamesCount: 1,
        winsCount: gameResult === GamesResultsEnum.WON ? 1 : 0,
        lossesCount: gameResult === GamesResultsEnum.LOST ? 1 : 0,
        drawsCount: gameResult === GamesResultsEnum.DRAW ? 1 : 0,
        avgScores: score,
        player: {
          id: userId,
          login: player.login,
        },
      });
    } else {
      userStats.sumScore += score;
      userStats.gamesCount += 1;
      userStats.winsCount += gameResult === GamesResultsEnum.WON ? 1 : 0;
      userStats.lossesCount += gameResult === GamesResultsEnum.LOST ? 1 : 0;
      userStats.drawsCount += gameResult === GamesResultsEnum.DRAW ? 1 : 0;
      userStats.avgScores = +(
        userStats.sumScore / userStats.gamesCount
      ).toFixed(2);
    }
  }
}

interface UserGameStatistics {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: {
    id: string;
    login: string;
  };
}
