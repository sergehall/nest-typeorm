import { Injectable } from '@nestjs/common';
import { TestingRepository } from './infrastructure/testing.repository';

@Injectable()
export class TestingService {
  constructor(protected testingRepository: TestingRepository) {}
  async removeAllCollections(): Promise<boolean> {
    return await this.testingRepository.removeAllCollections();
  }
}
