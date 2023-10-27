import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DatabaseHasBeenClearedEvent } from '../events/database-has-been-cleared.event';

@EventsHandler(DatabaseHasBeenClearedEvent)
export class ConsoleNamesOfClearedTablesEventHandler
  implements IEventHandler<DatabaseHasBeenClearedEvent>
{
  constructor() {}

  async handle(event: DatabaseHasBeenClearedEvent) {
    //    console.log(clearedTables)
    console.log('The names of cleared tables....', event.arrTables.length);
  }
}
