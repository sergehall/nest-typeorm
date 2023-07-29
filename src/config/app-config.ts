import { ConfigModuleOptions } from '@nestjs/config';
import { envFilePath } from '../detect-env';
import Configuration from './configuration';
import { validationSchema } from './validation-schema/validation-schema';

const AppModuleConfig: ConfigModuleOptions = {
  cache: true,
  isGlobal: true,
  envFilePath,
  validationSchema,
  load: [Configuration.getConfiguration],
};

export default AppModuleConfig;
