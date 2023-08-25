import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import * as uuid4 from 'uuid4';
import { TablesUsersWithIdEntity } from '../../features/users/entities/tables-user-with-id.entity';

export class SentCodeLogRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async addTime(user: TablesUsersWithIdEntity): Promise<boolean> {
    const id = uuid4().toString();
    const currentTime = new Date().toISOString();

    try {
      const query = `
        INSERT INTO public."SentCodeLog" ("id", "email", "sentCodeTime")
        VALUES ($1, $2, $3)
        RETURNING "id";
      `;
      const result = await this.db.query(query, [id, user.email, currentTime]);

      return result[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
