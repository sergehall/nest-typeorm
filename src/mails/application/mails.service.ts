import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SendRecoveryCodesCommand } from './use-case/send-recovery-codes.use-case';
import { SendConfirmationCodesCommand } from './use-case/send-confirmation-codes.use-case';

@Injectable()
export class MailsService {
  constructor(protected commandBus: CommandBus) {}

  async sendConfirmationCode(email: string, confirmationCode: string) {
    return await this.commandBus.execute(
      new SendConfirmationCodesCommand(email, confirmationCode),
    );
  }

  async sendRecoveryCode(email: string, recoveryCode: string) {
    return await this.commandBus.execute(
      new SendRecoveryCodesCommand(email, recoveryCode),
    );
  }
}
