import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { GameSummaryModel } from '../../models/game-summary.model';
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

  async execute(command: MyGamesStatisticCommand) {
    const { currentUserDto } = command;
    const { userId } = currentUserDto;

    const allGames = await this.pairsGameRepo.getAllGamesByUserId(userId);

    return await this.calculateUserGameStats(allGames, userId);
  }

  private async calculateUserGameStats(
    arrayGames: PairsGameEntity[],
    userId: string,
  ): Promise<GameSummaryModel> {
    let sumScore = 0;
    let gamesCount = 0;
    let winsCount = 0;
    let lossesCount = 0;
    let drawsCount = 0;

    for (const game of arrayGames) {
      // Check if the current user is one of the players in the game
      const isUserFirstPlayer = game.firstPlayer.userId === userId;
      const isUserSecondPlayer = game.secondPlayer!.userId === userId;

      if (isUserFirstPlayer || isUserSecondPlayer) {
        gamesCount++;

        // Calculate sumScore based on the current user's score
        sumScore += isUserFirstPlayer
          ? game.firstPlayerScore
          : game.secondPlayerScore;

        // Check the game result for the current user
        if (
          (isUserFirstPlayer &&
            game.firstPlayerGameResult === GamesResultsEnum.WON) ||
          (isUserSecondPlayer &&
            game.secondPlayerGameResult === GamesResultsEnum.WON)
        ) {
          winsCount++;
        } else if (
          (isUserFirstPlayer &&
            game.firstPlayerGameResult === GamesResultsEnum.LOST) ||
          (isUserSecondPlayer &&
            game.secondPlayerGameResult === GamesResultsEnum.LOST)
        ) {
          lossesCount++;
        } else {
          drawsCount++;
        }
      }
    }

    const avgScores =
      gamesCount > 0 ? Number((sumScore / gamesCount).toFixed(2)) : 0;

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
