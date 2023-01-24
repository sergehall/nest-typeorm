export const getConfiguration = () => {
  return {
    ENV: process.env.NODE_ENV || 'development',
    mongoose: {
      URI_DATABASE:
        process.env.ATLAS_URI ||
        process.env.MONGO_URI + '/' + process.env.NEST_DATABASE ||
        process.env.TEST_DATABASE,
    },
  };
};
