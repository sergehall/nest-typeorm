import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class PayPalAdapter {
  constructor(private readonly commandBus: CommandBus) {}

  async setWebhook(): Promise<void> {}
}
