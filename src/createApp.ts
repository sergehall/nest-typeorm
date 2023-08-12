import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { CustomHttpExceptionFilter } from './common/filters/custom-http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { TrimPipe } from './common/pipes/trim.pipe';

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
  app.useGlobalFilters(new CustomHttpExceptionFilter());
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
      // Enable automatic transformation of incoming payload data to matching types.
      transform: true,

      // Continue validating all properties, even if some validations fail.
      stopAtFirstError: false,

      // Custom exception factory to handle validation errors and throw BadRequestException.
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
  return app;
};
