import { Injectable } from '@nestjs/common';
import { MailsRawSqlRepository } from '../infrastructure/mails-raw-sql.repository';
import { EmailsConfirmCodeEntity } from '../entities/emails-confirm-code.entity';
import { EmailsRecoveryCodesEntity } from '../entities/emails-recovery-codes.entity';
import * as uuid4 from 'uuid4';
import { MailingStatus } from '../enums/status.enums';

@Injectable()
export class MailsService {
  constructor(private mailsRawSqlRepository: MailsRawSqlRepository) {}

  async registerSendEmail(
    email: string,
    confirmationCode: string,
    expirationDate: string,
  ) {
    const emailConfirmCodeEntity: EmailsConfirmCodeEntity =
      await this.createEmailConfirmCodeEntity(
        email,
        confirmationCode,
        expirationDate,
      );
    await this.addConfirmCodeToSendingTables(emailConfirmCodeEntity);
  }

  async findEmailRecCodeByOldestDate(): Promise<EmailsRecoveryCodesEntity[]> {
    return await this.mailsRawSqlRepository.findEmailRecCodeByOldestDate();
  }

  private async createEmailConfirmCodeEntity(
    email: string,
    confirmationCode: string,
    expirationDate: string,
  ): Promise<EmailsConfirmCodeEntity> {
    return {
      codeId: uuid4().toString(),
      email: email,
      confirmationCode: confirmationCode,
      expirationDate: expirationDate,
      createdAt: new Date().toISOString(),
      status: MailingStatus.PENDING,
    };
  }

  private async addConfirmCodeToSendingTables(
    emailConfirmCodeEntity: EmailsConfirmCodeEntity,
  ): Promise<string> {
    return await this.mailsRawSqlRepository.createEmailConfirmCode(
      emailConfirmCodeEntity,
    );
  }
}
