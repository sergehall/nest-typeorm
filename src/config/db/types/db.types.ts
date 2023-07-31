export type DatabaseConfigTypes = {
  pg: {
    url: {
      DATABASE_URL: string;
    };
    host: {
      PG_URI_LOCAL: string;
      PG_HOST_HEROKU: string;
    };
    port: {
      PG_PORT: number;
    };
    namesDatabase: {
      PG_LOCAL_DATABASE: string;
      PG_HEROKU_NAME_DATABASE: string;
    };
    authConfig: {
      PG_LOCAL_USER_NAME: string;
      PG_LOCAL_USER_PASSWORD: string;
      PG_HEROKU_USER_NAME: string;
      PG_HEROKU_USER_PASSWORD: string;
    };
  };
  mongo: {
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
};
