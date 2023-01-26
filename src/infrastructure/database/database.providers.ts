import { createConnection } from 'mongoose';
import { ConnectionEnums } from './enums/connection.enums';
import { BadGatewayException } from '@nestjs/common';
import { getConfiguration } from '../../config/configuration';
export const databaseProviders = [
  {
    provide: ConnectionEnums.ASYNC_CONNECTION,
    useFactory: async () => {
      const uri_database = getConfiguration().mongoose.URI_DATABASE;
      if (uri_database) {
        const connection = await createConnection(uri_database);
        console.log('Mongoose connected.');
        return connection;
      }
      throw new BadGatewayException();
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
