import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EmailConfimCodeEntity } from '../entities/email-confim-code.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailsConfirmCodeEntity } from '../../demons/entities/emailsConfirmCode.entity';

export class MailsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
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
  async findEmailByOldestDate(): Promise<EmailsConfirmCodeEntity[]> {
    try {
      const orderByDirection = `"createdAt" DESC`;
      const limit = 1;
      const offset = 0;
      return await this.db.query(
        `
        SELECT "id", "email", "confirmationCode", "createdAt"
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
  async removeEmailById(id: string): Promise<boolean> {
    try {
      const comment = await this.db.query(
        `
        DELETE FROM public."EmailsConfirmationCode"
        WHERE "id" = $1
        RETURNING "id"
          `,
        [id],
      );
      return comment[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }
}
