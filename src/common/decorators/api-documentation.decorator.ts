import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
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
      case 'Get blogs owned by the current user':
        summary = 'Get blogs owned by the current user';
        return applyDecorators(
          ApiOperation({ summary, description }),
          ApiBearerAuth(),
          ApiResponse({
            status: HttpStatus.OK,
            type: UserIdEmailLoginDto,
          }),
          ApiUnauthorizedResponse({ description: 'Unauthorized' }),
          // Inside your controller or controller method decorator
          ApiQuery({
            name: 'searchNameTerm',
            description:
              'Search term for blog Name: Name should contain this term in any position',
            required: false,
            type: String,
          }),
          ApiQuery({
            name: 'sortBy',
            description: 'Default value : createdAt',
            required: false,
            type: String,
          }),
          ApiQuery({
            name: 'sortDirection',
            description: 'Available values : asc, desc',
            required: false,
            enum: ['asc', 'desc'],
          }),
          ApiQuery({
            name: 'pageNumber',
            description: 'Page number',
            required: false,
            type: Number,
          }),
          ApiQuery({
            name: 'pageSize',
            description: 'pageSize is portions size that should be returned',
            required: false,
            type: Number,
          }),
        );
      default:
        // If no key matches, return an empty set of decorators
        return applyDecorators();
    }
  }
}
