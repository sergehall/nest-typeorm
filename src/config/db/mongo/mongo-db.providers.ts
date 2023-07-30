import { ConnectionEnums } from './enums/connection.enums';
import { MongoConnectionService } from './mongo-connection.service';

export const mongoConnectionProviders = [
  {
    provide: ConnectionEnums.ASYNC_ATLAS_CONNECTION,
    useFactory: async (mongoConnectionService: MongoConnectionService) => {
      return await mongoConnectionService.getConnectionByType('atlas');
    },
    inject: [MongoConnectionService],
  },
  // {
  //   provide: ConnectionEnums.ASYNC_LOCAL_CONNECTION, // Provide an identifier for the local connection provider
  //   useFactory: async (mongoConnectionService: MongoConnectionService) => {
  //     return await mongoConnectionService.getConnectionByType('local');
  //   },
  //   inject: [MongoConnectionService], // Inject the ConnectionProvider
  // },
];
