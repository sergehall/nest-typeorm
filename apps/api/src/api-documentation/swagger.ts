import { INestApplication, Logger } from '@nestjs/common';
import { OpenAPIObject, OperationObject, SwaggerModule } from '@nestjs/swagger';
import { Express, NextFunction, Request, Response, urlencoded } from 'express';
import { OPTIONAL_AUTH_EXTENSION } from './decorators/api-controller-documentation.decorator';
import {
  createSwaggerConfig,
  SWAGGER_ADMIN_PATH,
  SWAGGER_JSON_PATH,
  SWAGGER_LOGIN_PATH,
  SWAGGER_LOGOUT_PATH,
  SWAGGER_PATH,
  SWAGGER_SESSION_PATH,
  SWAGGER_YAML_PATH,
} from './swagger.config';
import { isLocalRuntime } from '../common/environment/runtime-environment';
import {
  resolveSwaggerAccessConfig,
  SwaggerAccessRole,
  SwaggerAccessService,
  SwaggerLoginAttemptLimiter,
} from './access/swagger-access.service';
import { renderSwaggerLoginPage, renderSwaggerLogoutPage } from './access/swagger-access.renderer';
import {
  addCspNonceToStyleElements,
  ensureResponseCspNonce,
} from '../common/security/content-security-policy';

const logger = new Logger('Swagger');
const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

export type SwaggerEnvironment = NodeJS.ProcessEnv;
type OptionalAuthOperation = OperationObject & { 'x-optional-auth'?: boolean };

export type SwaggerCoverageReport = {
  readonly operationCount: number;
  readonly missingSummaries: readonly string[];
  readonly missingTags: readonly string[];
  readonly missingSuccessResponses: readonly string[];
};

export function isSwaggerEnabled(environment: SwaggerEnvironment = process.env): boolean {
  const enabledForRuntime = isLocalRuntime(environment) || environment.SWAGGER_ENABLED === 'true';
  return enabledForRuntime && Boolean(resolveSwaggerAccessConfig(environment));
}

const allowedReturnPaths = new Set([
  `/${SWAGGER_PATH}`,
  `/${SWAGGER_ADMIN_PATH}`,
  SWAGGER_JSON_PATH,
  SWAGGER_YAML_PATH,
]);

function sanitizeReturnPath(value: unknown): string {
  return typeof value === 'string' && allowedReturnPaths.has(value) ? value : `/${SWAGGER_PATH}`;
}

function readFormValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function setPrivateResponseHeaders(response: Response): void {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
}

function createLoginRedirect(returnTo: string): string {
  return `${SWAGGER_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}

function requestPrefersHtml(request: Request): boolean {
  return request.headers.accept?.includes('text/html') === true;
}

function createAccessMiddleware(
  accessService: SwaggerAccessService,
  role: SwaggerAccessRole,
  machineReadable = false,
) {
  return (request: Request, response: Response, next: NextFunction): void => {
    setPrivateResponseHeaders(response);
    const authenticatedRole = accessService.readRequestSession(request, role);

    if (authenticatedRole) {
      next();
      return;
    }

    if (!machineReadable || requestPrefersHtml(request)) {
      response.redirect(303, createLoginRedirect(request.originalUrl));
      return;
    }

    response.status(401).json({
      statusCode: 401,
      message: 'Documentation authentication is required.',
      path: request.path,
    });
  };
}

function registerSwaggerAccessRoutes(
  expressApp: Express,
  accessService: SwaggerAccessService,
): void {
  const attemptLimiter = new SwaggerLoginAttemptLimiter();
  const loginBodyParser = urlencoded({ extended: false, limit: '4kb', parameterLimit: 8 });

  const renderLogin = (
    response: Response,
    returnTo: string,
    error?: string,
    status = 200,
  ): void => {
    const csrfToken = accessService.createCsrfToken();
    const cspNonce = ensureResponseCspNonce(response);
    accessService.setCsrfCookie(response, csrfToken);
    setPrivateResponseHeaders(response);
    response
      .status(status)
      .type('html')
      .send(renderSwaggerLoginPage({ csrfToken, returnTo, cspNonce, error }));
  };

  expressApp.get(SWAGGER_LOGIN_PATH, (request, response) => {
    const requestedReturnPath = sanitizeReturnPath(request.query.returnTo);
    const existingRole = accessService.readRequestSession(request, 'viewer');

    if (existingRole) {
      const destination = existingRole === 'admin' ? `/${SWAGGER_ADMIN_PATH}` : `/${SWAGGER_PATH}`;
      response.redirect(303, destination);
      return;
    }

    renderLogin(response, requestedReturnPath);
  });

  expressApp.post(SWAGGER_SESSION_PATH, loginBodyParser, async (request, response) => {
    const body = request.body as Record<string, unknown> | undefined;
    const username = readFormValue(body?.username).trim();
    const password = readFormValue(body?.password);
    const returnTo = sanitizeReturnPath(body?.returnTo);
    const attemptKey = `${request.ip}:${username.toLowerCase()}`;
    const retryAfter = attemptLimiter.getRetryAfterSeconds(attemptKey);

    if (retryAfter) {
      response.setHeader('Retry-After', retryAfter.toString());
      renderLogin(response, returnTo, 'Too many login attempts. Try again later.', 429);
      return;
    }

    if (!accessService.verifyCsrfToken(request, body?.csrfToken)) {
      renderLogin(response, returnTo, 'The login form expired. Please try again.', 403);
      return;
    }

    const role = await accessService.authenticate(username, password);
    if (!role) {
      attemptLimiter.recordFailure(attemptKey);
      renderLogin(response, returnTo, 'The username or password is invalid.', 401);
      return;
    }

    attemptLimiter.clear(attemptKey);
    accessService.setSessionCookie(response, accessService.createSession(role));
    const destination =
      returnTo === SWAGGER_JSON_PATH || returnTo === SWAGGER_YAML_PATH
        ? returnTo
        : role === 'admin'
          ? `/${SWAGGER_ADMIN_PATH}`
          : `/${SWAGGER_PATH}`;
    response.redirect(303, destination);
  });

  expressApp.get(SWAGGER_LOGOUT_PATH, (_request, response) => {
    const csrfToken = accessService.createCsrfToken();
    const cspNonce = ensureResponseCspNonce(response);
    accessService.setCsrfCookie(response, csrfToken);
    setPrivateResponseHeaders(response);
    response.type('html').send(renderSwaggerLogoutPage(csrfToken, cspNonce));
  });

  expressApp.post(SWAGGER_LOGOUT_PATH, loginBodyParser, (request, response) => {
    const body = request.body as Record<string, unknown> | undefined;
    if (!accessService.verifyCsrfToken(request, body?.csrfToken)) {
      response.status(403).send('The logout form expired.');
      return;
    }

    accessService.clearCookies(response);
    setPrivateResponseHeaders(response);
    response.redirect(303, SWAGGER_LOGIN_PATH);
  });

  expressApp.use(`/${SWAGGER_ADMIN_PATH}`, createAccessMiddleware(accessService, 'admin'));
  expressApp.use(SWAGGER_JSON_PATH, createAccessMiddleware(accessService, 'viewer', true));
  expressApp.use(SWAGGER_YAML_PATH, createAccessMiddleware(accessService, 'viewer', true));
  expressApp.use(`/${SWAGGER_PATH}`, createAccessMiddleware(accessService, 'viewer'));
}

function registerSwaggerUiCspMiddleware(expressApp: Express): void {
  const swaggerUiPaths = new Set([`/${SWAGGER_PATH}`, `/${SWAGGER_ADMIN_PATH}`]);

  expressApp.use((request, response, next) => {
    if (!swaggerUiPaths.has(request.path)) {
      next();
      return;
    }

    const originalSend = response.send.bind(response);
    response.send = ((body: unknown) => {
      if (typeof body !== 'string' || !body.includes('<div id="swagger-ui"></div>')) {
        return originalSend(body);
      }

      const nonce = ensureResponseCspNonce(response);
      const html = addCspNonceToStyleElements(body, nonce).replace(
        'style="position:absolute;width:0;height:0"',
        'class="swagger-ui-symbols"',
      );
      return originalSend(html);
    }) as Response['send'];

    next();
  });
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
    logger.warn(
      'Swagger is disabled because access control is not enabled or its Viewer/Admin secrets are incomplete.',
    );
    return undefined;
  }

  const accessConfig = resolveSwaggerAccessConfig(environment);
  if (!accessConfig) {
    return undefined;
  }

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  registerSwaggerAccessRoutes(expressApp, new SwaggerAccessService(accessConfig, environment));
  registerSwaggerUiCspMiddleware(expressApp);

  const document = createSwaggerDocument(app);
  const report = assertSwaggerCoverage(document);

  const commonSwaggerOptions = {
    displayRequestDuration: true,
    filter: true,
    persistAuthorization: false,
    validatorUrl: null,
  };

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: 'NestLab HTTP API — Viewer',
    explorer: true,
    customCss: '.swagger-ui-symbols { position: absolute; width: 0; height: 0; }',
    jsonDocumentUrl: SWAGGER_JSON_PATH,
    yamlDocumentUrl: SWAGGER_YAML_PATH,
    swaggerOptions: {
      ...commonSwaggerOptions,
      tryItOutEnabled: false,
      supportedSubmitMethods: [],
    },
  });

  SwaggerModule.setup(SWAGGER_ADMIN_PATH, app, document, {
    customSiteTitle: 'NestLab HTTP API — Admin',
    explorer: true,
    customCss: '.swagger-ui-symbols { position: absolute; width: 0; height: 0; }',
    jsonDocumentUrl: SWAGGER_JSON_PATH,
    yamlDocumentUrl: SWAGGER_YAML_PATH,
    swaggerOptions: {
      ...commonSwaggerOptions,
      tryItOutEnabled: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'],
    },
  });

  logger.log(
    `Swagger documents ${report.operationCount} HTTP operations at /${SWAGGER_PATH} (Viewer) and /${SWAGGER_ADMIN_PATH} (Admin).`,
  );
  return document;
}
