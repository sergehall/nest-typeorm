import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserIdEmailLoginDto } from '../../../features/auth/dto/profile.dto';

export class BloggerApiDocumentationDecorator {
  static apply(key: string, description?: string) {
    let summary;

    switch (key) {
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
              'Search term for blog Name: Name should contain this term in any position.\nDefault value: null',
            required: false,
            type: String,
            example: 'searchNameTerm',
          }),
          ApiQuery({
            name: 'sortBy',
            description: 'Field to sort by.\nDefault value: createdAt',
            required: false,
            type: String,
            example: 'createdAt',
          }),
          ApiQuery({
            name: 'sortDirection',
            description: 'Sort direction.\nDefault value: desc',
            required: false,
            enum: ['asc', 'desc'],
            example: 'desc',
          }),
          ApiQuery({
            name: 'pageNumber',
            description: 'Page number.\nDefault value: 1',
            required: false,
            type: Number,
            example: 1,
          }),
          ApiQuery({
            name: 'pageSize',
            description: 'Page size.\nDefault value: 10',
            required: false,
            type: Number,
            example: 10,
          }),
        );
      default:
        // If no key matches, return an empty set of swagger
        return applyDecorators();
    }
  }
}
