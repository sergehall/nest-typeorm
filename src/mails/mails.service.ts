import { Injectable } from '@nestjs/common';
import { EmailConfimCodeEntity } from './entities/email-confim-code.entity';
import { MailsAdapter } from './adapters/mails.adapter';
import { MailsRepository } from './infrastructure/mails.repository';
import { EmailsConfirmCode } from './infrastructure/schemas/email-confirm-code.schema';

@Injectable()
export class MailsService {
  constructor(
    private emailsAdapter: MailsAdapter,
    private mailsRepository: MailsRepository,
  ) {}
  async sendCodeByRegistration(
    emailAndCode: EmailConfimCodeEntity,
  ): Promise<void> {
    return await this.emailsAdapter.sendCodeByRegistration(emailAndCode);
  }
  async findEmailByOldestDate(): Promise<EmailsConfirmCode | null> {
    return await this.mailsRepository.findEmailByOldestDate();
  }
  async removeEmailById(id: string): Promise<boolean> {
    return await this.mailsRepository.removeEmailById(id);
  }
}
