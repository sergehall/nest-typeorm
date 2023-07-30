import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../configuration';
import { MailerPortTypes, MailerTypes } from './mailer.types';

@Injectable()
export class MailerConfig {
  constructor(protected configService: ConfigService<ConfigType, true>) {}

  getMailHost(key: MailerTypes): string {
    return this.getValueString(key);
  }

  getNodeMailerEmail(key: MailerTypes): string {
    return this.getValueString(key);
  }

  getNodeMailerAppPassword(key: MailerTypes): string {
    return this.getValueString(key);
  }

  getEmailPort(key: MailerPortTypes): number {
    return this.configService.get<number>(`mail.${key}`, {
      infer: true,
    });
  }

  private getValueString(key: string): string {
    return this.configService.get<string>(`mail.${key}`, {
      infer: true,
    });
  }
}
