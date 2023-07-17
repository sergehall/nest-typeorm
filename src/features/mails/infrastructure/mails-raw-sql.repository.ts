import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailsConfirmCodeEntity } from '../../demons/entities/emailsConfirmCode.entity';

export class MailsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async createEmailConfirmCode(
    newConfirmationCode: EmailsConfirmCodeEntity,
  ): Promise<EmailsConfirmCodeEntity> {
    try {
      return await this.db.query(
        `
        INSERT INTO public."EmailsConfirmationCode"
        ( "codeId", 
          "email", 
          "confirmationCode", 
          "expirationDate",
          "createdAt")
          VALUES ($1, $2, $3, $4, $5)
         `,
        [
          newConfirmationCode.codeId,
          newConfirmationCode.email,
          newConfirmationCode.confirmationCode,
          newConfirmationCode.expirationDate,
          newConfirmationCode.createdAt,
        ],
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async findEmailByOldestDate(): Promise<EmailsConfirmCodeEntity[]> {
    try {
      const orderByDirection = `"createdAt" DESC`;
      const limit = 1;
      const offset = 0;
      return await this.db.query(
        `
        SELECT "codeId", "email", "confirmationCode", "expirationDate", "createdAt"
        FROM public."EmailsConfirmationCode"
        ORDER BY ${orderByDirection}
        LIMIT $1 OFFSET $2
         `,
        [limit, offset],
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async removeEmailByCodeId(codeId: string): Promise<boolean> {
    try {
      const comment = await this.db.query(
        `
        DELETE FROM public."EmailsConfirmationCode"
        WHERE "codeId" = $1
        RETURNING "codeId"
          `,
        [codeId],
      );
      return comment[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }
}
