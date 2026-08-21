let envFilePath = '.env';
switch (process.env.NODE_ENV) {
  case 'development':
    envFilePath = '.env.dev';
    break;
  case 'testing':
    envFilePath = '.env.test';
    break;
}
export { envFilePath };
