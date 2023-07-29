import { Module } from '@nestjs/common';
import { mongoDbProviders } from './mongo-db.providers';

@Module({
  providers: [...mongoDbProviders],
  exports: [...mongoDbProviders],
})
export class MongoDBModule {}
