import { Module } from '@nestjs/common';
import { TestingService } from './application/testing.service';
import { TestingController } from './api/testing.controller';
import { TestingRawSqlRepository } from './infrastructure/testing-raw-sql.repository';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingService, TestingRawSqlRepository],
})
export class TestingModule {}
