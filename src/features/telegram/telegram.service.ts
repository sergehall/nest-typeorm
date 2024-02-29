import { Injectable } from '@nestjs/common';
import { CreateTelegramDto } from './dto/create-telegram.dto';

@Injectable()
export class TelegramService {
  createWebhook(createTelegramDto: CreateTelegramDto) {
    return `This action createWebhook a new telegram ${createTelegramDto}`;
  }

  getWebhook() {
    return { status: 'success' };
  }

  getAuthBotLink() {
    return `This action returns getAuthBotLink telegram`;
  }
}
