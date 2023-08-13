import { Injectable } from '@nestjs/common';
import { MailerPortTypes, MailerTypes } from './types/mailer.types';
import { BaseConfig } from '../base/base-config';

@Injectable()
export class MailerConfig extends BaseConfig {
  async getNodeMailer(key: MailerTypes): Promise<string> {
    return await this.getValueMailer(key);
  }

  async getMailerPort(key: MailerPortTypes): Promise<number> {
    return await this.getValueMailerPort(key);
  }
}
