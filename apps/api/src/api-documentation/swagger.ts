import { timingSafeEqual } from 'node:crypto';
import { INestApplication, Logger } from '@nestjs/common';
import { OpenAPIObject, OperationObject, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import { OPTIONAL_AUTH_EXTENSION } from './decorators/api-controller-documentation.decorator';
import {
  createSwaggerConfig,
  SWAGGER_JSON_PATH,
  SWAGGER_PATH,
  SWAGGER_YAML_PATH,
} from './swagger.config';

const logger = new Logger('Swagger');
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

type SwaggerEnvironment = NodeJS.ProcessEnv;
type OptionalAuthOperation = OperationObject & { 'x-optional-auth'?: boolean };

export type SwaggerCoverageReport = {
  readonly operationCount: number;
  readonly missingSummaries: readonly string[];
  readonly missingTags: readonly string[];
  readonly missingSuccessResponses: readonly string[];
};

function safeEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function createSwaggerBasicAuthMiddleware(environment: SwaggerEnvironment) {
  const expectedUsername = environment.SWAGGER_USERNAME ?? '';
  const expectedPassword = environment.SWAGGER_PASSWORD ?? '';

  return (request: Request, response: Response, next: NextFunction): void => {
    const authorization = request.headers.authorization;

    if (authorization?.startsWith('Basic ')) {
      const decoded = Buffer.from(authorization.slice('Basic '.length), 'base64').toString('utf8');
      const separatorIndex = decoded.indexOf(':');
      const username = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : '';
      const password = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : '';

      if (safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword)) {
        next();
        return;
      }
    }

    response.setHeader('WWW-Authenticate', 'Basic realm="NestLab API documentation"');
    response.status(401).send('Swagger authentication is required.');
  };
}

export function isSwaggerEnabled(environment: SwaggerEnvironment = process.env): boolean {
  if (environment.NODE_ENV !== 'production') {
    return true;
  }

  return (
    environment.SWAGGER_ENABLED === 'true' &&
    Boolean(environment.SWAGGER_USERNAME) &&
    Boolean(environment.SWAGGER_PASSWORD)
  );
}

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const document = SwaggerModule.createDocument(app, createSwaggerConfig(), {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
  });

  for (const pathItem of Object.values(document.paths)) {
    for (const method of httpMethods) {
      const operation = pathItem?.[method] as OptionalAuthOperation | undefined;

      if (!operation || operation[OPTIONAL_AUTH_EXTENSION] !== true) {
        continue;
      }

      operation.security = [{ 'access-token': [] }, {}];
      delete operation[OPTIONAL_AUTH_EXTENSION];
    }
  }

  return document;
}

export function inspectSwaggerCoverage(document: OpenAPIObject): SwaggerCoverageReport {
  let operationCount = 0;
  const missingSummaries: string[] = [];
  const missingTags: string[] = [];
  const missingSuccessResponses: string[] = [];

  for (const [path, pathItem] of Object.entries(document.paths)) {
    for (const method of httpMethods) {
      const operation = pathItem?.[method];

      if (!operation) {
        continue;
      }

      operationCount += 1;
      const operationLabel = `${method.toUpperCase()} ${path}`;

      if (!operation.summary?.trim()) {
        missingSummaries.push(operationLabel);
      }

      if (!operation.tags?.length) {
        missingTags.push(operationLabel);
      }

      if (!Object.keys(operation.responses ?? {}).some((status) => /^2\d\d$/.test(status))) {
        missingSuccessResponses.push(operationLabel);
      }
    }
  }

  return {
    operationCount,
    missingSummaries,
    missingTags,
    missingSuccessResponses,
  };
}

export function assertSwaggerCoverage(document: OpenAPIObject): SwaggerCoverageReport {
  const report = inspectSwaggerCoverage(document);
  const failures = [
    ...report.missingSummaries.map((operation) => `${operation}: missing summary`),
    ...report.missingTags.map((operation) => `${operation}: missing tag`),
    ...report.missingSuccessResponses.map(
      (operation) => `${operation}: missing successful response`,
    ),
  ];

  if (report.operationCount === 0 || failures.length > 0) {
    throw new Error(`Swagger coverage check failed:\n${failures.join('\n')}`);
  }

  return report;
}

export function setupSwagger(
  app: INestApplication,
  environment: SwaggerEnvironment = process.env,
): OpenAPIObject | undefined {
  if (!isSwaggerEnabled(environment)) {
    logger.log('Swagger is disabled for this environment.');
    return undefined;
  }

  if (environment.NODE_ENV === 'production') {
    app.use(`/${SWAGGER_PATH}`, createSwaggerBasicAuthMiddleware(environment));
  }

  const document = createSwaggerDocument(app);
  const report = assertSwaggerCoverage(document);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: 'NestLab HTTP API documentation',
    explorer: true,
    jsonDocumentUrl: SWAGGER_JSON_PATH,
    yamlDocumentUrl: SWAGGER_YAML_PATH,
    swaggerOptions: {
      displayRequestDuration: true,
      filter: true,
      persistAuthorization: true,
      tryItOutEnabled: false,
    },
  });

  logger.log(`Swagger documents ${report.operationCount} HTTP operations at /${SWAGGER_PATH}.`);
  return document;
}
