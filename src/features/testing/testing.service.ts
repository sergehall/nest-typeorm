import { Injectable } from '@nestjs/common';
import { TestingRawSqlRepository } from './infrastructure/testing-raw-sql.repository';

@Injectable()
export class TestingService {
  constructor(protected testingRawSqlRepository: TestingRawSqlRepository) {}
  async removeAllDataRawSQL(): Promise<void> {
    return await this.testingRawSqlRepository.removeAllDataRawSQL();
  }
}
