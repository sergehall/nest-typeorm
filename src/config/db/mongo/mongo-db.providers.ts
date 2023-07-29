import { MongoConnection } from './mongo-db-config';

export const mongoDbProviders = [MongoConnection.getMongoAtlasConnection()];
