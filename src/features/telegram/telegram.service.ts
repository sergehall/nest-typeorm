import { Injectable } from '@nestjs/common';
import { CreateTelegramDto } from './dto/create-telegram.dto';

@Injectable()
export class TelegramService {
  async createWebhook(createTelegramDto: CreateTelegramDto) {
    return `This action createWebhook a new telegram ${createTelegramDto}`;
  }

  async getWebhook() {
    return { status: 'success' };
  }

  async getAuthBotLink() {
    return `This action returns getAuthBotLink telegram`;
  }
}
