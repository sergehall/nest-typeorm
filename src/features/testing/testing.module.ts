import { Module } from '@nestjs/common';
import { TestingService } from './application/testing.service';
import { TestingController } from './api/testing.controller';
import { TestingDeleteAllDataRepository } from './infrastructure/testing-delete-all-data.repository';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingService, TestingDeleteAllDataRepository],
})
export class TestingModule {}
