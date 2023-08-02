import { Injectable } from '@nestjs/common';
import { MailsRawSqlRepository } from '../infrastructure/mails-raw-sql.repository';
import { EmailsConfirmCodeEntity } from '../entities/emails-confirm-code.entity';
import { EmailsRecoveryCodesEntity } from '../entities/emails-recovery-codes.entity';

@Injectable()
export class MailsService {
  constructor(private mailsRawSqlRepository: MailsRawSqlRepository) {}
  async findEmailConfCodeByOldestDate(): Promise<EmailsConfirmCodeEntity[]> {
    return await this.mailsRawSqlRepository.findEmailConfCodeByOldestDate();
  }
  async findEmailRecCodeByOldestDate(): Promise<EmailsRecoveryCodesEntity[]> {
    return await this.mailsRawSqlRepository.findEmailRecCodeByOldestDate();
  }
}
