import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { GamesResultsEnum } from '../../enums/games-results.enum';
import { GamesStatisticsViewModel } from '../../views/games-statistics.view-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SortType } from '../../../../common/query/types/sort.type';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatorDto } from '../../../../common/helpers/paginator.dto';
import { SortDirectionEnum } from '../../../../common/query/enums/sort-direction.enum';

export class GamesStatisticCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(GamesStatisticCommand)
export class GamesStatisticUseCase
  implements ICommandHandler<GamesStatisticCommand>
{
  constructor(protected pairsGameRepo: GamePairsRepo) {}

  async execute(command: GamesStatisticCommand): Promise<PaginatorDto> {
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
      await this.customSort(sort, pageNumber, pageSize, gamesStatistics);

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

  private async customSort(
    sortPriority: SortType,
    pageNumber: number,
    pageSize: number,
    arr: GamesStatisticsViewModel[],
  ): Promise<GamesStatisticsViewModel[]> {
    const startIndex = (pageNumber - 1) * pageSize;

    const sortedArray = [...arr]; // Create a shallow copy of the original array

    sortedArray.sort((a, b) => {
      for (const field of sortPriority) {
        const key = Object.keys(field)[0];

        // Check if the key is included in FieldsType
        if (
          key === 'avgScores' ||
          key === 'sumScore' ||
          key === 'winsCount' ||
          key === 'lossesCount'
        ) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const direction: SortDirectionEnum = field[key];

          const compareValue =
            direction === SortDirectionEnum.ASC
              ? a[key] - b[key]
              : b[key] - a[key];

          if (compareValue !== 0) {
            return compareValue;
          }
        }
      }

      // If no specific sorting order is specified for properties, maintain the original order.
      return 0;
    });

    // Return a slice of the sorted array based on startIndex and pageSize
    return sortedArray.slice(startIndex, startIndex + pageSize);
  }
}
