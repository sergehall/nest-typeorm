import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { TelegramConfig } from '../../../config/telegram/telegram.config';
import { deriveTelegramWebhookSecret, TelegramWebhookGuard } from './telegram-webhook.guard';

function createContext(secret: string | undefined): ExecutionContext {
  const request = {
    header: jest.fn().mockReturnValue(secret),
  } as unknown as Request;

  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('TelegramWebhookGuard', () => {
  const botToken = '123456:private-bot-token';
  const telegramConfig = {
    getTelegramValue: jest.fn().mockResolvedValue(botToken),
  } as unknown as TelegramConfig;
  const guard = new TelegramWebhookGuard(telegramConfig);

  it('accepts the secret registered with Telegram', async () => {
    const secret = deriveTelegramWebhookSecret(botToken);

    await expect(guard.canActivate(createContext(secret))).resolves.toBe(true);
  });

  it('rejects missing or incorrect secrets', async () => {
    await expect(guard.canActivate(createContext(undefined))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(guard.canActivate(createContext('incorrect'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
