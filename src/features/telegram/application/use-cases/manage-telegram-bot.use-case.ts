import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersEntity } from '../../../users/entities/users.entity';
import { NotFoundException } from '@nestjs/common';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { TelegramBotStatusRepo } from '../../infrastructure/telegram-bot-status.repo';
import { TelegramBotStatusEntity } from '../../entities/telegram-bot-status.entity';

export class ManageTelegramBotCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
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
    const { payloadTelegramMessage } = command;
    const inputString = payloadTelegramMessage.message.text;
    const telegramId = payloadTelegramMessage.message.from.id;

    console.log(inputString, 'inputString');
    // Extract the substring after '='
    const userId: string = inputString.substring(inputString.indexOf('=') + 1);
    console.log(userId, 'userId');
    const user: UsersEntity | null =
      await this.usersRepo.findNotBannedUserById(userId);
    console.log(user, 'user');
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const enableTelegramBotStatus: TelegramBotStatusEntity =
      await this.telegramBotStatusRepo.enableTelegramBotStatus(
        telegramId,
        user,
      );

    return `Thank you, you are ${enableTelegramBotStatus.botStatus} up for updates`;
  }
}
