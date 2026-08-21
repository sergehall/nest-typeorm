import { Module } from '@nestjs/common';
import { TestingService } from './application/testing.service';
import { TestingController } from './api/testing.controller';
import { TestingDeleteAllDataRepository } from './infrastructure/testing-delete-all-data.repository';
import { ConsoleNamesOfClearedTablesEventHandler } from './events-handlers/console-names-of-cleared-tables.event.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductionDisabledGuard } from '../../common/guards/production-disabled.guard';

const testingEventHandlers = [ConsoleNamesOfClearedTablesEventHandler];

@Module({
  imports: [CqrsModule],
  controllers: [TestingController],
  providers: [
    TestingService,
    TestingDeleteAllDataRepository,
    ProductionDisabledGuard,
    ...testingEventHandlers,
  ],
})
export class TestingModule {}
