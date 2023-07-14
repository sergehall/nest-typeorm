import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './api/testing.controller';
import { TestingRepository } from './infrastructure/testing.repository';
import { testingProviders } from './infrastructure/testing.provaiders';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { TestingRawSqlRepository } from './infrastructure/testing-raw-sql.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [TestingController],
  providers: [
    TestingService,
    TestingRepository,
    TestingRawSqlRepository,
    ...testingProviders,
  ],
})
export class TestingModule {}
