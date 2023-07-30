import { Module } from '@nestjs/common';
import { mongoConnectionProviders } from './mongo-db.providers';
import { ConnectionProvider } from './mongo-db-connection';

@Module({
  providers: [ConnectionProvider, ...mongoConnectionProviders],
  exports: [...mongoConnectionProviders],
})
export class MongoConnectionModule {}
