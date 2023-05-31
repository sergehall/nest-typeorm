import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/configuration';
import { createApp } from './createApp';

async function bootstrap() {
  const rawApp = await NestFactory.create<NestExpressApplication>(AppModule);
  const app = createApp(rawApp);
  const configService = app.get(ConfigService<ConfigType>);
  await app.listen(configService.get('PORT') || 5000, () => {
    console.log(`Example app listening on port: ${process.env.PORT || 5000}`);
  });
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
