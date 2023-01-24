import * as process from 'process';
let envFilePath = '.env';
switch (process.env.NODE_ENV) {
  case 'production':
    envFilePath = '.env.production';
    break;
  case 'testing':
    envFilePath = 'env.testing';
    break;
}
export { envFilePath };
