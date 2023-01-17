import { ForbiddenException, Inject } from '@nestjs/common';
import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { EmailConfimCodeEntity } from '../entities/email-confim-code.entity';
import { Model } from 'mongoose';
import {
  EmailsConfirmCode,
  EmailsConfirmCodeDocument,
} from './schemas/email-confirm-code.schema';

export class MailsRepository {
  constructor(
    @Inject(ProvidersEnums.CONFIRM_CODE_MODEL)
    private EmailsConfirmCodeModel: Model<EmailsConfirmCodeDocument>,
  ) {}
  async createEmailConfirmCode(
    newConfirmationCode: EmailConfimCodeEntity,
  ): Promise<EmailConfimCodeEntity> {
    try {
      return await this.EmailsConfirmCodeModel.create(newConfirmationCode);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async findEmailByOldestDate(): Promise<EmailsConfirmCode | null> {
    const email = await this.EmailsConfirmCodeModel.find({}, { _id: false })
      .sort({ createdAt: 1 })
      .limit(1)
      .lean();
    if (email.length === 0) {
      return null;
    }
    return email[0];
  }
  async removeEmailById(id: string): Promise<boolean> {
    const result = await this.EmailsConfirmCodeModel.deleteOne({ id: id });
    return result.deletedCount !== 0;
  }
}
