import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailsConfirmCodeEntity } from '../entities/emails-confirm-code.entity';
import { EmailsRecoveryCodesEntity } from '../entities/emails-recovery-codes.entity';
import { MailingStatus } from '../enums/status.enums';

export class MailsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async createEmailConfirmCode(
    newConfirmationCode: EmailsConfirmCodeEntity,
  ): Promise<string> {
    try {
      return await this.db.query(
        `
        INSERT INTO public."EmailsConfirmationCodes"
        ("codeId", "email", "confirmationCode", "expirationDate", "createdAt", "status")
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING "codeId"
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
    } catch (error) {
      console.log(error.message);
      throw new ForbiddenException(error.message);
    }
  }
  async createEmailRecoveryCode(
    newRecoveryCode: EmailsRecoveryCodesEntity,
  ): Promise<EmailsRecoveryCodesEntity[]> {
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
      return await this.db.query(query, values);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  async findOldestConfCode(): Promise<EmailsConfirmCodeEntity | null> {
    try {
      const pendingStatus = MailingStatus.PENDING;
      const sendingStatus = MailingStatus.SENDING;
      const orderByDirection = `"createdAt" ASC`;
      const limit = 1;

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

      const values = [pendingStatus, sendingStatus, limit];

      const result = await this.db.query(query, values);

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
    try {
      const pendingStatus = MailingStatus.PENDING;
      const sendingStatus = MailingStatus.SENDING;
      const orderByDirection = `"createdAt" ASC`;
      const limit = 1;

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

      const values = [pendingStatus, sendingStatus, limit];

      const result = await this.db.query(query, values);

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
      throw new ForbiddenException(error.message);
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

  async findEmailRecCodeByOldestDate(): Promise<EmailsRecoveryCodesEntity[]> {
    try {
      const sortBy = 'createdAt';
      const direction = 'DESC';
      const limit = 1;
      const offset = 0;
      return await this.db.query(
        `
        SELECT "codeId", "email", "recoveryCode", "expirationDate", "createdAt", "status"
        FROM public."EmailsRecoveryCodes"
        ORDER BY "${sortBy}" ${direction}
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
