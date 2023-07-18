import { Injectable } from '@nestjs/common';
import { MailsRawSqlRepository } from '../infrastructure/mails-raw-sql.repository';
import { EmailsConfirmCodeEntity } from '../../demons/entities/emailsConfirmCode.entity';
import { EmailsRecoveryCodesEntity } from '../../demons/entities/emailsRecoveryCodes.entity';

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
