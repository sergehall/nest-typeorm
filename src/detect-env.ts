let envFilePath = '.env';
switch (process.env.NODE_ENV) {
  case 'production':
    envFilePath = '.env';
    break;
  case 'development':
    envFilePath = 'dev.env';
    break;
  case 'testing':
    envFilePath = '.env.testing';
    break;
}
export { envFilePath };
