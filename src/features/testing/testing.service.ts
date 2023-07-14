import { Injectable } from '@nestjs/common';
import { TestingRepository } from './infrastructure/testing.repository';
import { TestingRawSqlRepository } from './infrastructure/testing-raw-sql.repository';

@Injectable()
export class TestingService {
  constructor(
    protected testingRepository: TestingRepository,
    protected testingRawSqlRepository: TestingRawSqlRepository,
  ) {}
  async removeAllCollections(): Promise<boolean> {
    return await this.testingRepository.removeAllCollections();
  }
  async removeAllDataRawSQL(): Promise<void> {
    return await this.testingRawSqlRepository.removeAllDataRawSQL();
  }
}
