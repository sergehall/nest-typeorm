import { Injectable } from '@nestjs/common';
import { MailsRepository } from '../infrastructure/mails.repository';
import { EmailsConfirmCode } from '../infrastructure/schemas/email-confirm-code.schema';

@Injectable()
export class MailsService {
  constructor(private mailsRepository: MailsRepository) {}
  async findEmailByOldestDate(): Promise<EmailsConfirmCode | null> {
    return await this.mailsRepository.findEmailByOldestDate();
  }
}
