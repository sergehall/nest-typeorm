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

  async activateTelegramBot(telegramId: number, user: UsersEntity) {
    const botStatus = BotStatus.ENABLED;
    return await this.manageTelegramBotStatus(telegramId, user, botStatus);
  }

  async deactivateTelegramBot(telegramId: number, user: UsersEntity) {
    const botStatus = BotStatus.DISABLED;
    return await this.manageTelegramBotStatus(telegramId, user, botStatus);
  }

  private async manageTelegramBotStatus(
    telegramId: number,
    user: UsersEntity,
    botStatus: BotStatus,
  ): Promise<TelegramBotStatusEntity> {
    const telegramBotStatusEntity: TelegramBotStatusEntity | null =
      //
      // const queryBuilder = this.telegramBotStatusRepository
      //   .createQueryBuilder('posts')
      //   .where({ dependencyIsBanned: false })
      //   .andWhere({ isBanned: false })
      //   .innerJoinAndSelect('posts.blog', 'blog')
      //   .innerJoinAndSelect('posts.postOwner', 'postOwner')
      //   .andWhere('blog.id = :blogId', { blogId });

      await this.telegramBotStatusRepository.findOne({
        where: { telegramId, user: { userId: user.userId } },
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
