import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import * as uuid4 from 'uuid4';

export class SentCodeLogRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async addTime(email: string): Promise<boolean> {
    const id = uuid4().toString();
    const currentTime = new Date().toISOString();

    try {
      const query = `
        INSERT INTO public."SentCodeLog" ("id", "email", "sentCodeTime")
        VALUES ($1, $2, $3)
        RETURNING "id";
      `;
      const result = await this.db.query(query, [id, email, currentTime]);

      return result[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
