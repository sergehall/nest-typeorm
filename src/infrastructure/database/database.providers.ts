import { createConnection } from 'mongoose';
import { ConnectionEnums } from './enums/connection.enums';
import { getConfiguration } from '../../config/configuration';
import { InternalServerErrorException } from '@nestjs/common';
export const databaseProviders = [
  {
    provide: ConnectionEnums.ASYNC_CONNECTION,
    useFactory: async () => {
      // const connection = await createConnection(
      //   process.env.ATLAS_URI + '/' + process.env.NEST_DATABASE,
      // );
      const uri_database = getConfiguration().mongoose.URI_DATABASE;
      if (!uri_database) {
        throw new InternalServerErrorException();
      }
      const connection = await createConnection(uri_database);
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
