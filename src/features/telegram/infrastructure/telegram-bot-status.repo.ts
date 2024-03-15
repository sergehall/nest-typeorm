import { InjectRepository } from '@nestjs/typeorm';
import { TelegramBotStatusEntity } from '../entities/telegram-bot-status.entity';
import { Repository } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { BotStatus } from '../enums/bot-status.enum';
import { InternalServerErrorException } from '@nestjs/common';

export class TelegramBotStatusRepo {
  constructor(
    @InjectRepository(TelegramBotStatusEntity)
    private readonly telegramBotStatusRepository: Repository<TelegramBotStatusEntity>,
  ) {}

  async activateTelegramBot(
    telegramId: number,
    user: UsersEntity,
  ): Promise<TelegramBotStatusEntity> {
    const botStatus = BotStatus.ENABLED;
    try {
      return await this.manageTelegramBotStatus(telegramId, user, botStatus);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while activating the Telegram bot.',
      );
    }
  }

  async deactivateTelegramBot(
    telegramId: number,
    user: UsersEntity,
  ): Promise<TelegramBotStatusEntity> {
    const botStatus = BotStatus.DISABLED;
    return await this.manageTelegramBotStatus(telegramId, user, botStatus);
  }

  private async manageTelegramBotStatus(
    telegramId: number,
    user: UsersEntity,
    botStatus: BotStatus,
  ): Promise<TelegramBotStatusEntity> {
    const telegramBotStatusEntity: TelegramBotStatusEntity | null =
      await this.telegramBotStatusRepository.findOne({
        where: { telegramId, user: { userId: user.userId } },
      });

    if (telegramBotStatusEntity) {
      telegramBotStatusEntity.botStatus = botStatus;
      return await this.telegramBotStatusRepository.save(
        telegramBotStatusEntity,
      );
    }

    const newTelegramBotStatusEntity: TelegramBotStatusEntity =
      TelegramBotStatusEntity.createTelegramBotStatusEntity(
        telegramId,
        user,
        botStatus,
      );

    return await this.telegramBotStatusRepository.save(
      newTelegramBotStatusEntity,
    );
  }
}
