import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { TestingRepository } from './infrastructure/testing.repository';
import { testingProviders } from './infrastructure/testing.provaiders';
import { DatabaseModule } from '../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository, ...testingProviders],
})
export class TestingModule {}
