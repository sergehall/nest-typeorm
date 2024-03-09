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
    public activationCode: string,
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
    const { payloadTelegramMessage, activationCode } = command;
    const inputString = payloadTelegramMessage.message.text;
    const telegramId = payloadTelegramMessage.message.from.id;

    console.log(inputString, 'inputString');
    console.log(activationCode, 'activationCode');
    // Extract the substring after '='
    const code: string = inputString.substring(inputString.indexOf('=') + 1);
    console.log(code, 'code');
    const user: UsersEntity | null =
      await this.usersRepo.findNotBannedUserById(code);
    console.log(user, 'user');
    if (!user) {
      throw new NotFoundException(`User with ID ${code} not found`);
    }
    const enableTelegramBotStatus: TelegramBotStatusEntity =
      await this.telegramBotStatusRepo.activateTelegramBot(telegramId, user);

    return `Thank you, you are ${enableTelegramBotStatus.botStatus} up for updates`;
  }
}
