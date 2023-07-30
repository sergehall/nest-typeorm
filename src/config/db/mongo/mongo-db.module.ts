import { Module } from '@nestjs/common';
import { mongoConnectionProviders } from './mongo-db.providers';
import { MongoConnectionService } from './mongo-connection.service';

@Module({
  providers: [MongoConnectionService, ...mongoConnectionProviders],
  exports: [...mongoConnectionProviders],
})
export class MongoConnectionModule {}
