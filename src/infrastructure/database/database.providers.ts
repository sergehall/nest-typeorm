import { createConnection } from 'mongoose';
import { ConnectionEnums } from './enums/connection.enums';

export const databaseProviders = [
  {
    provide: ConnectionEnums.ASYNC_CONNECTION,
    useFactory: async () => {
      const connection = await createConnection(
        process.env.ATLAS_URI + '/' + process.env.NEST_DATABASE,
      );
      console.log('Mongoose connected.');
      return connection;
    },
  },

  // {
  //   provide: ConnectionEnums.DATABASE_CONNECTION,
  //   useFactory: async (): Promise<typeof mongoose> =>
  //     await mongoose.connect(
  //       process.env.ATLAS_URI + '/' + process.env.NEST_DATABASE,
  //     ),
  // },
];
