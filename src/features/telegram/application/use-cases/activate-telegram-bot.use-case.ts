import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersEntity } from '../../../users/entities/users.entity';
import { NotFoundException } from '@nestjs/common';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';

export class ActivateTelegramBotCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}

@CommandHandler(ActivateTelegramBotCommand)
export class ActivateTelegramBotUseCase
  implements ICommandHandler<ActivateTelegramBotCommand>
{
  constructor(protected usersRepo: UsersRepo) {}
  async execute(command: ActivateTelegramBotCommand): Promise<boolean> {
    const { payloadTelegramMessage } = command;
    const userId = payloadTelegramMessage.message.text;
    console.log(userId, 'userId');
    const user: UsersEntity | null =
      await this.usersRepo.findNotBannedUserById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return true;
  }
}
