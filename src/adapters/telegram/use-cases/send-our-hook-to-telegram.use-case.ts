import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class SendOurHookToTelegramCommand {
  constructor() {}
}

@CommandHandler(SendOurHookToTelegramCommand)
export class SendOurHookToTelegramUseCase
  implements ICommandHandler<SendOurHookToTelegramCommand>
{
  async execute(comand: SendOurHookToTelegramCommand) {
    return true;
  }
}
