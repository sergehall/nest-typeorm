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
import { swaggerUtils } from './swagger.utils';

export class ApiDocumentation {
  static apply(key: string, description?: string) {
    let summary;
    const badRequestResponse = swaggerUtils.badRequestResponse();

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
              'Search term for blog Name: Name should contain this term in any position. Default value: null',
            required: false,
            type: String,
          }),
          ApiQuery({
            name: 'sortBy',
            description: 'Field to sort by. \nDefault value: createdAt',
            required: false,
            type: String,
          }),
          ApiQuery({
            name: 'sortDirection',
            description: 'Sort direction. \nDefault value: desc',
            required: false,
            enum: ['asc', 'desc'],
          }),
          ApiQuery({
            name: 'pageNumber',
            description: 'Page number. \nDefault value: 1',
            required: false,
            type: Number,
          }),
          ApiQuery({
            name: 'pageSize',
            description: 'Page size. \nDefault value: 10',
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
