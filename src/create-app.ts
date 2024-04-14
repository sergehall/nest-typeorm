import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionResponseFilter } from './common/filters/http-exception-response-filter';
import * as cookieParser from 'cookie-parser';
import { TrimPipe } from './common/pipes/trim.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configure the IoC container for the NestJS application.
 *
 * @param app The INestApplication instance of the NestJS application.
 */
function setupContainer(app: INestApplication): void {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
}

/**
 * Set up the global exception filter for the NestJS application.
 *
 * @param app The INestApplication instance of the NestJS application.
 */
function setupExceptionFilter(app: INestApplication): void {
  app.useGlobalFilters(new HttpExceptionResponseFilter());
}

/**
 * Add cookie-parser middleware to the NestJS application.
 *
 * @param app The INestApplication instance of the NestJS application.
 */
function setupCookieParser(app: INestApplication): void {
  app.use(cookieParser());
}

/**
 * Set up global pipes for data transformation and validation in the NestJS application.
 *
 * @param app The INestApplication instance of the NestJS application.
 */
function setupGlobalPipes(app: INestApplication): void {
  app.useGlobalPipes(
    // Custom pipe to automatically trim whitespace from incoming request data.
    new TrimPipe(),

    // Validation pipe to automatically validate incoming request payloads.
    new ValidationPipe({
      // Enable automatic transformation of incoming payload data to matching dto.
      transform: true,

      // Continue validating all properties, even if some validations fail.
      stopAtFirstError: false,

      // Custom exception stripe to handle validation errors and throw BadRequestException.
      exceptionFactory: (errors) => {
        // Transform each validation error into a custom error object.
        const customErrors = errors.map((e) => {
          const firstError = JSON.stringify(e.constraints);
          return { field: e.property, message: firstError };
        });

        // Throw a BadRequestException with the custom error object.
        throw new BadRequestException(customErrors);
      },
    }),
  );
}

/**
 * Set up Swagger documentation for the NestJS application.
 *
 * @param app The INestApplication instance of the NestJS application.
 */
function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
      description: 'Enter JWT Bearer token only',
    })
    .addSecurity('basic', {
      type: 'http',
      scheme: 'basic',
      description: 'Login with username and password',
    })
    .setTitle('IT-Incubator API')
    .setDescription(
      "The Training IT-Incubator API is a versatile RESTful API built with Nests for managing training activities. It offers endpoints for user management, blog creation, post management, commenting, scheduling, and email notifications. Additionally, it integrates seamlessly with payment systems like Stripe and PayPal to facilitate secure transactions. Postgresql is utilized for database storage, and AWS S3 is employed for file storage. Moreover, it includes integration with Telegram. With its modular architecture, it's easy to build and deploy training applications of any scale. <a href='https://it-incubator.io'>Learn more</a>",
    )
    .setVersion('36.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);
}

/**
 * Function to configure and set up a NestJS application.
 *
 * @param app The INestApplication instance of the NestJS application.
 * @returns The same INestApplication instance after applying configurations.
 */
export const createApp = (app: INestApplication): INestApplication => {
  setupContainer(app);
  setupExceptionFilter(app);
  setupCookieParser(app);
  setupGlobalPipes(app);
  setupSwagger(app);
  return app;
};
