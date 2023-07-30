import { Module } from '@nestjs/common';
import { mongoConnectionProviders } from './mongo-db.providers';
import { MongoConnectionProvider } from './mongo-db-connection';

@Module({
  providers: [MongoConnectionProvider, ...mongoConnectionProviders],
  exports: [...mongoConnectionProviders],
})
export class MongoConnectionModule {}
