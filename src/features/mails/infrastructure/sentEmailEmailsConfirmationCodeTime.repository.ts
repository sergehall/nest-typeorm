import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

export class SentEmailEmailsConfirmationCodeTimeRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async addConfirmationCode(
    codeId: string,
    email: string,
    currentTime: string,
  ) {
    try {
      return await this.db.query(
        `
        INSERT INTO public."SentEmailEmailsConfirmationCodeTime" ("codeId", "userId", "email", "sentConfirmCodeTime")
        SELECT $1::uuid, u."id"::uuid, $2, $3
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
}
