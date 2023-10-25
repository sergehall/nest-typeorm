import { PairsGameEntity } from '../../entities/pairs-game.entity';
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { StatusGameEnum } from '../../enums/status-game.enum';
import { FinishGameForAnotherUseCommand } from './finish-game-for-another-user.use-case';

export class PlayerAnswersAllQuestionsCommand {
  constructor(
    public game: PairsGameEntity,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(PlayerAnswersAllQuestionsCommand)
export class PlayerAnswersAllQuestionsUseCase
  implements ICommandHandler<PlayerAnswersAllQuestionsCommand>
{
  constructor(
    protected gamePairsRepo: GamePairsRepo,
    protected commandBus: CommandBus,
    protected eventBus: EventBus,
  ) {}

  async execute(command: PlayerAnswersAllQuestionsCommand): Promise<boolean> {
    const { game, currentUserDto } = command;
    const TEN_SECONDS = 10000; // 10 seconds in milliseconds

    // Schedule a separate asynchronous operation to finish the game after a 10-second delay
    setTimeout(async () => {
      const currentGame = await this.gamePairsRepo.getGameByPairId(game.id);

      if (currentGame && currentGame.status !== StatusGameEnum.FINISHED) {
        // After the 10-second delay, update the game status to "FINISHED" and record the finishGameDate
        currentGame.status = StatusGameEnum.FINISHED;
        currentGame.finishGameDate = new Date().toISOString();

        // Save the updated game StatusGameEnum.FINISHED
        await this.gamePairsRepo.saveGame(currentGame);

        // Handle unanswered questions for the other player
        await this.commandBus.execute(
          new FinishGameForAnotherUseCommand(currentGame, currentUserDto),
        );

        // publish GameOverEvent
        currentGame.events.forEach((e) => {
          this.eventBus.publish(e);
        });
      }
    }, TEN_SECONDS);

    // Return true immediately
    return true;
  }
}
