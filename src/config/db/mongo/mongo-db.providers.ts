import { ConnectionEnums } from './enums/connection.enums';
import { ConnectionProvider } from './mongo-db-connection';

export const mongoConnectionProviders = [
  {
    provide: ConnectionEnums.ASYNC_ATLAS_CONNECTION,
    useFactory: async (connectionProvider: ConnectionProvider) => {
      return await connectionProvider.getConnectionByType('atlas');
    },
    inject: [ConnectionProvider],
  },
  // {
  //   provide: ConnectionEnums.ASYNC_LOCAL_CONNECTION, // Provide an identifier for the local connection provider
  //   useFactory: async (connectionProvider: ConnectionProvider) => {
  //     return await connectionProvider.getConnectionByType('local');
  //   },
  //   inject: [ConnectionProvider], // Inject the ConnectionProvider
  // },
];
