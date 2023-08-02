export type MongoDatabaseConfigTypes = {
  url: {
    MONGO_URI_LOCAL: string;
    ATLAS_URI: string;
  };
  namesDatabase: {
    NEST_DATABASE: string;
    TEST_DATABASE: string;
    DEV_DATABASE: string;
    PROD_NEST_DATABASE: string;
  };
};
