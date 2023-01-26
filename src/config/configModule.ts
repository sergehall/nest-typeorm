import { ConfigModule } from '@nestjs/config';
import { envFilePath } from '../detect-env';
import { getConfiguration } from './configuration';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: envFilePath,
  load: [getConfiguration],
});
