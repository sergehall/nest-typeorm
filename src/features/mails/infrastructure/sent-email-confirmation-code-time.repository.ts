import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export class SentEmailsTimeConfirmAndRecoverCodesRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async addConfirmationCode(
    codeId: string,
    email: string,
    currentTime: string,
  ) {
    try {
      return await this.db.query(
        `
        INSERT INTO public."SentEmailsTimeConfirmAndRecoverCodes" 
        ("codeId", "userId", "email", "sentConfirmCodeTime")
        SELECT $1::uuid, u."userId"::uuid, $2, $3
        FROM public."Users" u
        WHERE u."email" = $4
        RETURNING "codeId";
      `,
        [codeId, email, currentTime, email],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeSentEmailsTimeByUserId(userId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."SentEmailsTimeConfirmAndRecoverCodes"
        WHERE "userId" = $1
          `,
        [userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }
}
