import { Injectable } from '@nestjs/common';
import { CreateTelegramDto } from './dto/create-telegram.dto';

@Injectable()
export class TelegramService {
  async getWebhook() {
    return { status: 'success' };
  }
  async createWebhook(createTelegramDto: CreateTelegramDto) {
    return `This action createWebhook a new telegram ${createTelegramDto}`;
  }

  async getAuthBotLink() {
    return `This action returns getAuthBotLink telegram`;
  }
}
