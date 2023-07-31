import { Module } from '@nestjs/common';
import { TestingService } from './application/testing.service';
import { TestingController } from './api/testing.controller';
import { TestingRepository } from './infrastructure/testing.repository';
import { testingProviders } from './infrastructure/testing.provaiders';
import { TestingRawSqlRepository } from './infrastructure/testing-raw-sql.repository';
import { MongoConnectionModule } from '../../config/db/mongo/mongo-db.module';

@Module({
  imports: [MongoConnectionModule],
  controllers: [TestingController],
  providers: [
    TestingService,
    TestingRepository,
    TestingRawSqlRepository,
    ...testingProviders,
  ],
})
export class TestingModule {}
