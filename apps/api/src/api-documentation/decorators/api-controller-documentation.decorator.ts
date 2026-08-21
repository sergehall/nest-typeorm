import { HttpStatus, RequestMethod } from '@nestjs/common';
import { GUARDS_METADATA, HTTP_CODE_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiExtension,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  type ApiResponseOptions,
} from '@nestjs/swagger';
import { ApiErrorResponseDto, ApiValidationErrorResponseDto } from '../dto/api-error-response.dto';

type GuardLike = {
  readonly name?: string;
  readonly constructor?: { readonly name?: string };
};
type ControllerPrototype = Record<string, unknown>;

const OPTIONAL_AUTH_EXTENSION = 'x-optional-auth';
const API_RESPONSE_METADATA = 'swagger/apiResponse';

function humanizeMethodName(methodName: string): string {
  const withoutScopePrefix = methodName.replace(/^(open|sa)(?=[A-Z])/, '');
  const words = withoutScopePrefix
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/\bId\b/g, 'ID')
    .trim();

  return words.charAt(0).toUpperCase() + words.slice(1);
}

function getGuardName(guard: GuardLike): string {
  return guard.name ?? guard.constructor?.name ?? '';
}

function getDefaultSuccessStatus(requestMethod: RequestMethod): number {
  return requestMethod === RequestMethod.POST ? HttpStatus.CREATED : HttpStatus.OK;
}

function applyMethodDecorators(
  prototype: ControllerPrototype,
  methodName: string,
  descriptor: PropertyDescriptor,
  decorators: readonly MethodDecorator[],
): void {
  for (const decorator of decorators) {
    decorator(prototype, methodName, descriptor);
  }
}

export function ApiControllerDocumentation(): ClassDecorator {
  return (target) => {
    const prototype = target.prototype as ControllerPrototype;
    const controllerName = target.name.replace(/Controller$/, '');
    const controllerGuards = (Reflect.getMetadata(GUARDS_METADATA, target) ?? []) as GuardLike[];

    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      if (methodName === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
      const handler = descriptor?.value;

      if (!descriptor || typeof handler !== 'function') {
        continue;
      }

      const requestMethod = Reflect.getMetadata(METHOD_METADATA, handler) as
        RequestMethod | undefined;

      if (requestMethod === undefined) {
        continue;
      }

      const summary = humanizeMethodName(methodName);
      const methodGuards = (Reflect.getMetadata(GUARDS_METADATA, handler) ?? []) as GuardLike[];
      const guardNames = [...controllerGuards, ...methodGuards].map(getGuardName);
      const successStatus =
        (Reflect.getMetadata(HTTP_CODE_METADATA, handler) as number | undefined) ??
        getDefaultSuccessStatus(requestMethod);
      const existingResponses = (Reflect.getMetadata(API_RESPONSE_METADATA, handler) ?? {}) as
        Record<string, ApiResponseOptions> | undefined;
      const existingSuccessResponse = existingResponses?.[successStatus];
      const successResponse: ApiResponseOptions = {
        ...(existingSuccessResponse ?? {}),
        status: successStatus,
        description:
          successStatus === HttpStatus.NO_CONTENT
            ? 'The operation completed successfully and returned no response body.'
            : 'The operation completed successfully.',
      };
      const decorators: MethodDecorator[] = [
        ApiOperation(
          {
            summary,
            description: `Executes the ${summary.toLowerCase()} operation in the ${controllerName} API.`,
          },
          { overrideExisting: false },
        ),
        ApiResponse(successResponse),
        ApiBadRequestResponse({
          description: 'The request parameters, query, or body failed validation.',
          type: ApiValidationErrorResponseDto,
        }),
      ];

      const usesBearerAuth = guardNames.some((name) =>
        ['JwtAuthGuard', 'JwtAuthAndActiveGameGuard'].includes(name),
      );
      const usesRefreshCookie = guardNames.includes('CookiesJwtVerificationGuard');
      const usesBasicAuth = guardNames.includes('SaBasicAuthGuard');
      const usesOptionalBearer = guardNames.some((name) =>
        ['IfGuestUsersGuard', 'NoneStatusGuard'].includes(name),
      );
      const usesLocalCredentials = guardNames.includes('LocalAuthGuard');
      const checksAbilities = guardNames.includes('AbilitiesGuard');

      if (usesBearerAuth) {
        decorators.push(ApiBearerAuth('access-token'));
      }

      if (usesRefreshCookie) {
        decorators.push(ApiCookieAuth('refresh-cookie'));
      }

      if (usesBasicAuth) {
        decorators.push(ApiBasicAuth('basic'));
      }

      if (usesOptionalBearer) {
        decorators.push(ApiBearerAuth('access-token'), ApiExtension(OPTIONAL_AUTH_EXTENSION, true));
      }

      if (usesBearerAuth || usesRefreshCookie || usesBasicAuth || usesLocalCredentials) {
        decorators.push(
          ApiUnauthorizedResponse({
            description: 'Authentication credentials are missing, invalid, or expired.',
            type: ApiValidationErrorResponseDto,
          }),
        );
      }

      if (checksAbilities) {
        decorators.push(
          ApiForbiddenResponse({
            description: 'The authenticated principal is not allowed to perform this operation.',
            type: ApiErrorResponseDto,
          }),
        );
      }

      applyMethodDecorators(prototype, methodName, descriptor, decorators);
    }
  };
}

export { OPTIONAL_AUTH_EXTENSION };
