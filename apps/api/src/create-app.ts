import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionResponseFilter } from './common/filters/http-exception-response-filter';
import cookieParser from 'cookie-parser';
import { TrimPipe } from './common/pipes/trim.pipe';
import { setupSwagger } from './api-documentation/swagger';

function setupCors(app: INestApplication): void {
  const configuredOrigins = process.env.WEB_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const developmentOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin:
      configuredOrigins && configuredOrigins.length > 0
        ? configuredOrigins
        : process.env.NODE_ENV === 'production'
          ? false
          : developmentOrigins,
    credentials: true,
  });
}

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
 * Function to configure and set up a NestJS application.
 *
 * @param app The INestApplication instance of the NestJS application.
 * @returns The same INestApplication instance after applying configurations.
 */
export const createApp = (app: INestApplication): INestApplication => {
  setupCors(app);
  setupContainer(app);
  setupExceptionFilter(app);
  setupCookieParser(app);
  setupGlobalPipes(app);
  setupSwagger(app);
  return app;
};
