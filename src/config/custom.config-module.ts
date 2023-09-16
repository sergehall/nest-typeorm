import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Configuration from './configuration';
import { envFilePath } from '../detect-env';
import { validationSchemaConfiguration } from './validation-schema.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath,
      validationSchema: validationSchemaConfiguration,
      load: [Configuration.getConfiguration],
    }),
  ],
})
export class CustomConfigModule {}
