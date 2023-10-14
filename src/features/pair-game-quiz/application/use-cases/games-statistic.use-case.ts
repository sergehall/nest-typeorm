import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { GamesResultsEnum } from '../../enums/games-results.enum';
import { GamesStatisticsViewModel } from '../../view-models/games-statistics.view-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SortType } from '../../../../common/query/types/sort.type';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { SortDirectionEnum } from '../../../../common/query/enums/sort-direction.enum';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';

export class GamesStatisticCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(GamesStatisticCommand)
export class GamesStatisticUseCase
  implements ICommandHandler<GamesStatisticCommand>
{
  constructor(protected pairsGameRepo: GamePairsRepo) {}

  async execute(command: GamesStatisticCommand): Promise<PaginatedResultDto> {
    const { queryData } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;
    const { sort } = queryData;

    const allGames: PairsGameEntity[] = await this.pairsGameRepo.getAllGames();

    if (allGames.length === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const gamesStatistics: GamesStatisticsViewModel[] =
      await this.gamesStatistics(allGames);

    const sortedGamesStatistics: GamesStatisticsViewModel[] =
      await this.customSort(sort, gamesStatistics);

    const totalCount = gamesStatistics.length;

    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: sortedGamesStatistics,
    };
  }

  private async gamesStatistics(
    allGames: PairsGameEntity[],
  ): Promise<GamesStatisticsViewModel[]> {
    const userStatisticsMap = new Map<string, GamesStatisticsViewModel>();

    for (const game of allGames) {
      // Process the first player
      await this.updateUserStatistics(
        userStatisticsMap,
        game.firstPlayer,
        game.firstPlayerScore,
        game.firstPlayerGameResult,
      );

      // Process the second player if it exists
      if (game.secondPlayer) {
        await this.updateUserStatistics(
          userStatisticsMap,
          game.secondPlayer,
          game.secondPlayerScore,
          game.secondPlayerGameResult,
        );
      }
    }

    return Array.from(userStatisticsMap.values());
  }

  private async customSort(
    sortPriority: SortType,
    arr: GamesStatisticsViewModel[],
  ): Promise<GamesStatisticsViewModel[]> {
    return arr.sort((a, b) => {
      if (sortPriority.avgScores === SortDirectionEnum.ASC) {
        if (a.avgScores < b.avgScores) return -1;
        if (a.avgScores > b.avgScores) return 1;
      } else if (sortPriority.avgScores === SortDirectionEnum.DESC) {
        if (a.avgScores > b.avgScores) return -1;
        if (a.avgScores < b.avgScores) return 1;
      }

      if (sortPriority.sumScore === SortDirectionEnum.ASC) {
        if (a.sumScore < b.sumScore) return -1;
        if (a.sumScore > b.sumScore) return 1;
      } else if (sortPriority.sumScore === SortDirectionEnum.DESC) {
        if (a.sumScore > b.sumScore) return -1;
        if (a.sumScore < b.sumScore) return 1;
      }

      if (sortPriority.winsCount === SortDirectionEnum.ASC) {
        if (a.winsCount < b.winsCount) return -1;
        if (a.winsCount > b.winsCount) return 1;
      } else if (sortPriority.winsCount === SortDirectionEnum.DESC) {
        if (a.winsCount > b.winsCount) return -1;
        if (a.winsCount < b.winsCount) return 1;
      }

      if (sortPriority.lossesCount === SortDirectionEnum.ASC) {
        if (a.lossesCount < b.lossesCount) return -1;
        if (a.lossesCount > b.lossesCount) return 1;
      } else if (sortPriority.lossesCount === SortDirectionEnum.DESC) {
        if (a.lossesCount > b.lossesCount) return -1;
        if (a.lossesCount < b.lossesCount) return 1;
      }

      return 0; // If all properties are equal
    });
  }

  private async updateUserStatistics(
    userStatisticsMap: Map<string, GamesStatisticsViewModel>,
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
