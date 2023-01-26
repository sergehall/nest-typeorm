let envFilePath = '.env';
switch (process.env.NODE_ENV) {
  case 'development':
    envFilePath = 'dev.env';
    break;
  case 'testing':
    envFilePath = '.env.testing';
    break;
}
export { envFilePath };
