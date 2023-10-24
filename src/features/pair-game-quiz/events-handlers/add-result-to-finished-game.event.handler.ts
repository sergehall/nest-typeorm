import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GameOverEvent } from '../events/game-over.event';
import { AddResultToPairGameCommand } from '../application/use-cases/add-result-to-pair-game.use-case';

@EventsHandler(GameOverEvent)
export class AddResultToFinishedGameEventHandler
  implements IEventHandler<GameOverEvent>
{
  constructor(protected commandBus: CommandBus) {}

  async handle(event: GameOverEvent): Promise<boolean> {
    return await this.commandBus.execute(
      new AddResultToPairGameCommand(event.game),
    );
  }
}
