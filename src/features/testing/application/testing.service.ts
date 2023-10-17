import { Injectable } from '@nestjs/common';
import { TestingDeleteAllDataRepository } from '../infrastructure/testing-delete-all-data.repository';

@Injectable()
export class TestingService {
  constructor(
    protected testingDeleteAllDataRepository: TestingDeleteAllDataRepository,
  ) {}
  async removeAllDataRawSQL(): Promise<void> {
    return await this.testingDeleteAllDataRepository.removeAllData();
  }
}
