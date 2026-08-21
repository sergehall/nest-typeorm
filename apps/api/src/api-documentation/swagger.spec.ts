import {
  CanActivate,
  Controller,
  Delete,
  ExecutionContext,
  Get,
  HttpCode,
  HttpStatus,
  INestApplication,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiControllerDocumentation } from './decorators/api-controller-documentation.decorator';
import { ApiCollectionQuery } from './decorators/api-query-parameters.decorator';
import { createSwaggerDocument, inspectSwaggerCoverage, isSwaggerEnabled } from './swagger';

class JwtAuthGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

class NoneStatusGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

class CookiesJwtVerificationGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

class SaBasicAuthGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

@ApiTags('Documentation test')
@ApiControllerDocumentation()
@Controller('documentation-test')
class DocumentationTestController {
  @Get('public')
  @ApiCollectionQuery({ filters: ['searchNameTerm'] })
  @ApiOkResponse({ type: String, description: 'Returns the public resource.' })
  getPublicResource(): string {
    return 'ok';
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtectedResource(): string {
    return 'ok';
  }

  @UseGuards(NoneStatusGuard)
  @Get('optional-auth')
  getOptionalResource(): string {
    return 'ok';
  }

  @UseGuards(CookiesJwtVerificationGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-cookie')
  rotateSession(): string {
    return 'ok';
  }

  @UseGuards(SaBasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('admin')
  removeAdministrativeResource(): void {}
}

describe('Swagger architecture', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DocumentationTestController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('documents summaries, tags, success responses, and every authentication mode', () => {
    const document = createSwaggerDocument(app);
    const report = inspectSwaggerCoverage(document);

    expect(report).toEqual({
      operationCount: 5,
      missingSummaries: [],
      missingTags: [],
      missingSuccessResponses: [],
    });
    expect(document.paths['/documentation-test/protected']?.get?.security).toEqual([
      { 'access-token': [] },
    ]);
    expect(document.paths['/documentation-test/optional-auth']?.get?.security).toEqual([
      { 'access-token': [] },
      {},
    ]);
    expect(document.paths['/documentation-test/refresh-cookie']?.post?.security).toEqual([
      { 'refresh-cookie': [] },
    ]);
    expect(document.paths['/documentation-test/admin']?.delete?.security).toEqual([{ basic: [] }]);
    expect(document.paths['/documentation-test/admin']?.delete?.responses).toHaveProperty('204');
    const publicResponse = document.paths['/documentation-test/public']?.get?.responses['200'];
    expect(
      publicResponse && 'content' in publicResponse
        ? publicResponse.content?.['application/json']?.schema
        : undefined,
    ).toEqual({ type: 'string' });
    expect(
      document.paths['/documentation-test/public']?.get?.parameters?.map((parameter) =>
        'name' in parameter ? parameter.name : undefined,
      ),
    ).toEqual(['pageNumber', 'pageSize', 'sortBy', 'sortDirection', 'searchNameTerm']);
  });

  it('enables Swagger only with complete Viewer and Admin access configuration', () => {
    const accessEnvironment = {
      SWAGGER_VIEWER_USERNAME: 'viewer',
      SWAGGER_VIEWER_PASSWORD_HASH: '$argon2id$viewer-hash-value-with-more-than-forty-characters',
      SWAGGER_ADMIN_USERNAME: 'admin',
      SWAGGER_ADMIN_PASSWORD_HASH: '$argon2id$admin-hash-value-with-more-than-forty-characters',
      SWAGGER_SESSION_SECRET: 'session-secret-with-more-than-forty-three-characters',
      SWAGGER_SESSION_TTL_SECONDS: '1200',
    };

    expect(isSwaggerEnabled({ NODE_ENV: 'development' })).toBe(false);
    expect(isSwaggerEnabled({ NODE_ENV: 'development', ...accessEnvironment })).toBe(true);
    expect(isSwaggerEnabled({ NODE_ENV: 'production' })).toBe(false);
    expect(
      isSwaggerEnabled({
        NODE_ENV: 'production',
        SWAGGER_ENABLED: 'true',
        ...accessEnvironment,
      }),
    ).toBe(true);
    expect(
      isSwaggerEnabled({
        NODE_ENV: 'production',
        SWAGGER_ENABLED: 'true',
        ...accessEnvironment,
        SWAGGER_ADMIN_PASSWORD_HASH: undefined,
      }),
    ).toBe(false);
  });
});
