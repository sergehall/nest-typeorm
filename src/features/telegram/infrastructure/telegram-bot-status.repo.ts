import { InjectRepository } from '@nestjs/typeorm';
import { TelegramBotStatusEntity } from '../entities/telegram-bot-status.entity';
import { Repository } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { BotStatus } from '../enums/bot-status.enum';

export class TelegramBotStatusRepo {
  constructor(
    @InjectRepository(TelegramBotStatusEntity)
    protected telegramBotStatusRepository: Repository<TelegramBotStatusEntity>,
  ) {}

  async enableTelegramBotStatus(telegramId: number, user: UsersEntity) {
    const botStatus = BotStatus.ENABLED;
    return await this.manageTelegramBotStatus(telegramId, user, botStatus);
  }

  async disabledTelegramBotStatus(telegramId: number, user: UsersEntity) {
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
        where: { telegramId, user },
      });

    if (telegramBotStatusEntity) {
      telegramBotStatusEntity.botStatus = botStatus;
      return await this.telegramBotStatusRepository.save(
        telegramBotStatusEntity,
      );
    }

    const newTelegramBotStatusEntity =
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
