import { ForbiddenException, Inject } from '@nestjs/common';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { EmailConfimCodeEntity } from '../entities/email-confim-code.entity';
import { Model } from 'mongoose';
import {
  EmailsConfirmCode,
  EmailsConfirmCodeDocument,
} from './schemas/email-confirm-code.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class MailsRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    @Inject(ProvidersEnums.CONFIRM_CODE_MODEL)
    private EmailsConfirmCodeModel: Model<EmailsConfirmCodeDocument>,
  ) {}
  async createEmailConfirmCode(
    newConfirmationCode: EmailConfimCodeEntity,
  ): Promise<EmailConfimCodeEntity> {
    try {
      return await this.db.query(
        `
        INSERT INTO public."EmailsConfirmationCode"
        ( "id", 
          "email", 
          "confirmationCode", 
          "createdAt")
          VALUES ($1, $2, $3, $4)
         `,
        [
          newConfirmationCode.id,
          newConfirmationCode.email,
          newConfirmationCode.confirmationCode,
          newConfirmationCode.createdAt,
        ],
      );
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
