import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/configuration';
import { createApp } from './create-app';
import { TelegramAdapter } from './adapters/telegram/telegram.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  // // Set global prefix
  // app.setGlobalPrefix('api');

  // Apply configurations using the createApp function (assuming it configures the app)
  createApp(app);

  // Retrieve the configuration service to access environment variables
  const configService = app.get(ConfigService<ConfigType, true>);

  // Retrieve the port from environment variables, default to 5000 if not provided
  const port = configService.get<number>('PORT') || 5000;

  // Start the application and listen on the specified port
  await app.listen(port, () => {
    console.log(`Example app listening on port: ${port}`);
  });

  // Get the base URL at which the application is running
  const baseUrl = await app.getUrl();
  console.log(`Application is running on url: ${baseUrl}`);

  const telegramAdapter = await app.resolve(TelegramAdapter);

  await telegramAdapter.setWebhook();
}

// Call the bootstrap function to start the application
bootstrap();
