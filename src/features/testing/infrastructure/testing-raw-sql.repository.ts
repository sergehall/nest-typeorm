import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

export class TestingRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async removeAllDataRawSQL(): Promise<void> {
    try {
      await this.db.query(`
      DELETE FROM public."SecurityDevices"
    `);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
