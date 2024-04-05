import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserViewModel } from '../../features/users/views/user.view-model';
import { UserIdEmailLoginDto } from '../../features/auth/dto/profile.dto';

export class ApiDocumentation {
  static apply(key: string, description?: string) {
    let summary;
    const badRequestResponse = {
      description: 'If the inputModel has incorrect values',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              errorsMessages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    field: { type: 'string' },
                  },
                },
              },
            },
          },
          example: {
            errorsMessages: [
              {
                message: 'Invalid value',
                field: 'fieldName',
              },
            ],
          },
        },
      },
    };

    switch (key) {
      case 'App':
        summary = 'Get hello message';
        return applyDecorators(
          ApiOperation({ summary, description }),
          ApiResponse({
            status: HttpStatus.OK,
          }),
        );
      case 'Me':
        summary = 'Get information about the current user';
        return applyDecorators(
          ApiOperation({ summary, description }),
          ApiBearerAuth(),
          ApiResponse({
            status: HttpStatus.OK,
            type: UserIdEmailLoginDto,
          }),
          ApiUnauthorizedResponse({ description: 'Unauthorized' }),
        );
      case 'Create user':
        summary = 'Add a new user to the system';
        return applyDecorators(
          ApiOperation({ summary, description }),
          ApiBasicAuth(),
          ApiBadRequestResponse(badRequestResponse),
          ApiUnauthorizedResponse({ description: 'Unauthorized' }),
          ApiResponse({
            status: HttpStatus.CREATED,
            type: UserViewModel,
            description: 'The user data has been successfully created',
          }),
        );
      default:
        // If no key matches, return an empty set of decorators
        return applyDecorators();
    }
  }
}
