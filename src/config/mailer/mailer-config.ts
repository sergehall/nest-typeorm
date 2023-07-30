import { Injectable } from '@nestjs/common';
import { MailerPortTypes, MailerTypes } from './types/mailer.types';
import { BaseConfig } from '../base/base-config';

@Injectable()
export class MailerConfig extends BaseConfig {
  getNodeMailerValue(key: MailerTypes): string {
    return this.getValueMailer(key);
  }

  getMailerPort(key: MailerPortTypes): number {
    return this.getValueMailerPort(key);
  }
}
