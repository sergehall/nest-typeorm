import { Injectable } from '@nestjs/common';
import { MailsRawSqlRepository } from '../infrastructure/mails-raw-sql.repository';
import { EmailsConfirmCodeEntity } from '../../demons/entities/emailsConfirmCode.entity';

@Injectable()
export class MailsService {
  constructor(private mailsRawSqlRepository: MailsRawSqlRepository) {}
  async findEmailByOldestDate(): Promise<EmailsConfirmCodeEntity[]> {
    return await this.mailsRawSqlRepository.findEmailByOldestDate();
  }
}
