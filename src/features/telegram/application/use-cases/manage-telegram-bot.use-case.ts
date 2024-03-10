import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersEntity } from '../../../users/entities/users.entity';
import { NotFoundException } from '@nestjs/common';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { TelegramBotStatusRepo } from '../../infrastructure/telegram-bot-status.repo';
import { TelegramBotStatusEntity } from '../../entities/telegram-bot-status.entity';

export class ManageTelegramBotCommand {
  constructor(
    public payloadTelegramMessage: PayloadTelegramMessageType,
    public code: string,
  ) {}
}

@CommandHandler(ManageTelegramBotCommand)
export class ManageTelegramBotUseCase
  implements ICommandHandler<ManageTelegramBotCommand>
{
  constructor(
    protected usersRepo: UsersRepo,
    protected telegramBotStatusRepo: TelegramBotStatusRepo,
  ) {}

  async execute(command: ManageTelegramBotCommand): Promise<string> {
    const { payloadTelegramMessage, code } = command;
    const telegramId = payloadTelegramMessage.message.from.id;
    const name: string =
      payloadTelegramMessage.message.from.first_name ||
      payloadTelegramMessage.message.from.username ||
      'new user';

    const user: UsersEntity | null =
      await this.usersRepo.findNotBannedUserById(code);

    if (!user) {
      throw new NotFoundException(`User with ID ${code} not found`);
    }
    const enableTelegramBotStatus: TelegramBotStatusEntity =
      await this.telegramBotStatusRepo.activateTelegramBot(telegramId, user);

    return `Thank you ${name}! You are now ${enableTelegramBotStatus.botStatus} for updates.`;
  }
}
