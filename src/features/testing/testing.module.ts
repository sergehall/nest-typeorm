import { Module } from '@nestjs/common';
import { TestingService } from './application/testing.service';
import { TestingController } from './api/testing.controller';
import { TestingDeleteAllDataRepository } from './infrastructure/testing-delete-all-data.repository';
import { ConsoleNamesOfClearedTablesEventHandler } from './events-handlers/console-names-of-cleared-tables.event.handler';
import { CqrsModule } from '@nestjs/cqrs';

const testingEventHandlers = [ConsoleNamesOfClearedTablesEventHandler];

@Module({
  imports: [CqrsModule],
  controllers: [TestingController],
  providers: [
    TestingService,
    TestingDeleteAllDataRepository,
    ...testingEventHandlers,
  ],
})
export class TestingModule {}
