import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SendOurWebhookToTelegramCommand } from '../../features/telegram/application/use-cases/send-our-webhook-to-telegram.use-case';

@Injectable()
export class TelegramAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  async setWebhook(): Promise<void> {
    await this.commandBus.execute(new SendOurWebhookToTelegramCommand());
  }
}
