import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailsConfirmCodeEntity } from '../../demons/entities/emailsConfirmCode.entity';
import { EmailsRecoveryCodesEntity } from '../../demons/entities/emailsRecoveryCodes.entity';

export class MailsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async createEmailConfirmCode(
    newConfirmationCode: EmailsConfirmCodeEntity,
  ): Promise<EmailsConfirmCodeEntity> {
    try {
      return await this.db.query(
        `
        INSERT INTO public."EmailsConfirmationCodes"
        ( "codeId", 
          "email", 
          "confirmationCode", 
          "expirationDate",
          "createdAt")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
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
  async createEmailRecoveryCode(
    newRecoveryCode: EmailsRecoveryCodesEntity,
  ): Promise<EmailsRecoveryCodesEntity[]> {
    try {
      const query = `
        INSERT INTO public."EmailsRecoveryCodes" 
        ("codeId", "email", "recoveryCode", "expirationDate", "createdAt")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `;
      const values = [
        newRecoveryCode.codeId,
        newRecoveryCode.email,
        newRecoveryCode.recoveryCode,
        newRecoveryCode.expirationDate,
        newRecoveryCode.createdAt,
      ];
      return await this.db.query(query, values);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async findEmailConfCodeByOldestDate(): Promise<EmailsConfirmCodeEntity[]> {
    try {
      const orderByDirection = `"createdAt" DESC`;
      const limit = 1;
      const offset = 0;
      return await this.db.query(
        `
        SELECT "codeId", "email", "confirmationCode", "expirationDate", "createdAt"
        FROM public."EmailsConfirmationCodes"
        ORDER BY ${orderByDirection}
        LIMIT $1 OFFSET $2
         `,
        [limit, offset],
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  async findEmailRecCodeByOldestDate(): Promise<EmailsRecoveryCodesEntity[]> {
    try {
      const orderByDirection = `"createdAt" DESC`;
      const limit = 1;
      const offset = 0;
      return await this.db.query(
        `
        SELECT "codeId", "email", "recoveryCode", "expirationDate", "createdAt"
        FROM public."EmailsRecoveryCodes"
        ORDER BY ${orderByDirection}
        LIMIT $1 OFFSET $2
         `,
        [limit, offset],
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async removeEmailConfirmCodesByCodeId(codeId: string): Promise<boolean> {
    try {
      const comment = await this.db.query(
        `
        DELETE FROM public."EmailsConfirmationCodes"
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
  async removeEmailRecoverCodesByCodeId(codeId: string): Promise<boolean> {
    try {
      const comment = await this.db.query(
        `
        DELETE FROM public."EmailsRecoveryCodes"
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
