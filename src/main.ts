import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/configuration';
import { createApp } from './create-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  createApp(app); // Apply configurations using the createApp function

  // // Run migrations separately if needed
  // const migrationsApp = await NestFactory.createApplicationContext(
  //   MigrationsModule,
  // );
  // await migrationsApp.init();

  const configService = app.get(ConfigService<ConfigType>);
  const port = configService.get<number>('PORT') || 5000;

  await app.listen(port, () => {
    console.log(`Example app listening on port: ${port}`);
  });

  const baseUrl = await app.getUrl();
  console.log(`Application is running on url: ${baseUrl}`);
}

bootstrap();
