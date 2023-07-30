import { Module } from '@nestjs/common';
import { mongoConnectionProviders } from './mongo-db.providers';
import { MongoConnectionService } from './mongo-db-connection';

@Module({
  providers: [MongoConnectionService, ...mongoConnectionProviders],
  exports: [...mongoConnectionProviders],
})
export class MongoConnectionModule {}
