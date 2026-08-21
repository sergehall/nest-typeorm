import { createHash, timingSafeEqual } from 'node:crypto';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { TelegramConfig } from '../../../config/telegram/telegram.config';

const TELEGRAM_SECRET_HEADER = 'x-telegram-bot-api-secret-token';

export function deriveTelegramWebhookSecret(botToken: string): string {
  return createHash('sha256').update(botToken).digest('hex');
}

@Injectable()
export class TelegramWebhookGuard implements CanActivate {
  constructor(private readonly telegramConfig: TelegramConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const actualSecret = request.header(TELEGRAM_SECRET_HEADER) ?? '';
    const botToken = await this.telegramConfig.getTelegramValue('TOKEN_TELEGRAM_IT_INCUBATOR');
    const expectedSecret = deriveTelegramWebhookSecret(botToken);
    const actualBuffer = Buffer.from(actualSecret);
    const expectedBuffer = Buffer.from(expectedSecret);

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid Telegram webhook secret.');
    }

    return true;
  }
}
