import { ConfigModule } from '@nestjs/config';
import { configuration } from './configuration';
import { envFilePath } from '../detect-env';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: envFilePath,
  load: [configuration],
});
