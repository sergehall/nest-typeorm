import { ConfigModuleOptions } from '@nestjs/config';
import { envFilePath } from '../detect-env';
import Configuration from './configuration';
import { validationSchemaConfiguration } from './validation-schema.configuration';

const AppConfigModuleOptions: ConfigModuleOptions = {
  cache: true,
  isGlobal: true,
  envFilePath,
  validationSchema: validationSchemaConfiguration,
  load: [Configuration.getConfiguration],
};

export default AppConfigModuleOptions;
