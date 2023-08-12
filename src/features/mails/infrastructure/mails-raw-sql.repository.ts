import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailsConfirmCodeEntity } from '../entities/emails-confirm-code.entity';
import { EmailsRecoveryCodesEntity } from '../entities/emails-recovery-codes.entity';
import { MailingStatus } from '../enums/status.enums';
import { SentEmailTableNames } from '../application/types/sent-email-table-names';

export class MailsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async insertEmailConfirmationCode2(
    newConfirmationCode: EmailsConfirmCodeEntity,
  ): Promise<EmailsConfirmCodeEntity> {
    try {
      const insert = await this.db.query(
        `
        INSERT INTO public."EmailsConfirmationCodes"
        ("codeId", "email", "confirmationCode", "expirationDate", "createdAt", "status")
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
         `,
        [
          newConfirmationCode.codeId,
          newConfirmationCode.email,
          newConfirmationCode.confirmationCode,
          newConfirmationCode.expirationDate,
          newConfirmationCode.createdAt,
          newConfirmationCode.status,
        ],
      );
      return insert[0];
    } catch (error) {
      console.log(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  async insertEmailRecoveryCode(
    newRecoveryCode: EmailsRecoveryCodesEntity,
  ): Promise<EmailsRecoveryCodesEntity> {
    try {
      const query = `
        INSERT INTO public."EmailsRecoveryCodes" 
        ("codeId", "email", "recoveryCode", "expirationDate", "createdAt",  "status")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `;
      const values = [
        newRecoveryCode.codeId,
        newRecoveryCode.email,
        newRecoveryCode.recoveryCode,
        newRecoveryCode.expirationDate,
        newRecoveryCode.createdAt,
        newRecoveryCode.status,
      ];

      const insert = await this.db.query(query, values);
      return insert[0];
    } catch (error) {
      console.log(error.message);
      // Handle any errors that occur during the process
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOldestConfCode(): Promise<EmailsConfirmCodeEntity | null> {
    const pendingStatus = MailingStatus.PENDING;
    const sendingStatus = MailingStatus.SENDING;
    const orderByDirection = `"createdAt" ASC`;
    const limit = 1;

    try {
      // Construct the query using a CTE to select the oldest pending code
      // and update its status to "sending"
      const query = `
      WITH oldest_pending AS (
        SELECT "codeId", "email", "confirmationCode", "expirationDate", "createdAt", "status"
        FROM public."EmailsConfirmationCodes"
        WHERE "status" = $1
        ORDER BY ${orderByDirection}
        LIMIT $3
        FOR UPDATE SKIP LOCKED
      )
      UPDATE public."EmailsConfirmationCodes"
      SET "status" = $2
      FROM oldest_pending
      WHERE public."EmailsConfirmationCodes"."codeId" = oldest_pending."codeId"
      RETURNING oldest_pending.*;
    `;

      const parameters = [pendingStatus, sendingStatus, limit];
      const result = await this.db.query(query, parameters);

      // Adjust this part based on the actual structure of the result
      // and return the updated confirmation code or null
      return result[0][0] ? result[0][0] : null;
    } catch (error) {
      console.log(error.message);
      // Handle any errors that occur during the process
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOldestRecoveryCode(): Promise<EmailsRecoveryCodesEntity | null> {
    const pendingStatus = MailingStatus.PENDING;
    const sendingStatus = MailingStatus.SENDING;
    const orderByDirection = `"createdAt" ASC`;
    const limit = 1;

    try {
      // Construct the query using a CTE to select the oldest pending code
      // and update its status to "sending"
      const query = `
      WITH oldest_pending AS (
        SELECT "codeId", "email", "recoveryCode", "expirationDate", "createdAt", "status"
        FROM public."EmailsRecoveryCodes"
        WHERE "status" = $1
        ORDER BY ${orderByDirection}
        LIMIT $3
        FOR UPDATE SKIP LOCKED
      )
      UPDATE public."EmailsRecoveryCodes"
      SET "status" = $2
      FROM oldest_pending
      WHERE public."EmailsRecoveryCodes"."codeId" = oldest_pending."codeId"
      RETURNING oldest_pending.*;
    `;

      const parameters = [pendingStatus, sendingStatus, limit];
      const result = await this.db.query(query, parameters);

      // Adjust this part based on the actual structure of the result
      // and return the updated recovery code or null
      return result[0][0] ? result[0][0] : null;
    } catch (error) {
      console.log(error.message);
      // Handle any errors that occur during the process
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateConfirmationCodesStatusToSent(codeId: string): Promise<void> {
    try {
      const status: MailingStatus = MailingStatus.SENT;
      await this.db.query(
        `
        UPDATE public."EmailsConfirmationCodes"
        SET "status" = $1
        WHERE "codeId" = $2
        `,
        [status, codeId],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateRecoveryCodesStatusToSent(codeId: string): Promise<void> {
    try {
      const status: MailingStatus = MailingStatus.SENT;
      await this.db.query(
        `
        UPDATE public."EmailsRecoveryCodes"
        SET "status" = $1
        WHERE "codeId" = $2
        `,
        [status, codeId],
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  async clearingSentEmails() {
    const status: MailingStatus = MailingStatus.SENT;
    try {
      return await this.db.query(
        `
        DELETE FROM public."EmailsConfirmationCodes"
        WHERE "status" = $1
        RETURNING "codeId"
          `,
        [status],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async clearSentEmailCodes(tableName: SentEmailTableNames) {
    const status: MailingStatus = MailingStatus.SENT;
    const currentTime = new Date().toISOString();

    try {
      const query = `
      DELETE FROM public."${tableName}"
      WHERE "status" = $1 OR "expirationDate" < $2
    `;

      const queryParams = [status, currentTime];

      return await this.db.query(query, queryParams);
    } catch (error) {
      console.error('Error while clearing email codes:', error.message);
      throw new InternalServerErrorException(
        'Error while clearing email codes.',
      );
    }
  }
}
