import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SendRecoveryCodesCommand } from './use-case/send-recovery-codes.use-case';
import { SendConfirmationCodesCommand } from './use-case/send-confirmation-codes.use-case';
import { UsersEntity } from '../../../features/users/entities/users.entity';

@Injectable()
export class MailsService {
  constructor(protected commandBus: CommandBus) {}

  async sendConfirmationCode(user: UsersEntity): Promise<boolean> {
    return await this.commandBus.execute(
      new SendConfirmationCodesCommand(user),
    );
  }

  async sendRecoveryCode(updatedUser: UsersEntity): Promise<boolean> {
    return await this.commandBus.execute(
      new SendRecoveryCodesCommand(updatedUser),
    );
  }
}
