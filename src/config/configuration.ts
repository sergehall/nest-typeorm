export const getConfiguration = () => {
  return {
    ENV: process.env.NODE_ENV || 'development',
    mongoose: {
      uri: {
        ATLAS_URI: process.env.ATLAS_URI,
        MONGO_URI: process.env.MONGO_URI,
      },
    },
    database: {
      NEST_DATABASE: process.env.NEST_DATABASE,
      TEST_DATABASE: process.env.TEST_DATABASE,
    },
    mail: {
      NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
    },
    appUrl: {
      NEST_API_URL: process.env.NEST_API_URL,
    },
  };
};
