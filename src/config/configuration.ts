export const getConfiguration = () => {
  return {
    ENV: process.env.NODE_ENV || 'development',
    mongoose: {
      uri: {
        ATLAS_URI: process.env.ATLAS_URI,
        MONGO_URI: process.env.MONGO_URI,
        TEST_DATABASE: process.env.TEST_DATABASE,
      },
    },
    database: {
      NEST_DATABASE: process.env.NEST_DATABASE,
    },
  };
};
