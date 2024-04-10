import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBasicAuth,
} from '@nestjs/swagger';
import { UserViewModel } from '../../../features/users/views/user.view-model';
import { swaggerUtils } from '../utils/swagger.utils';

export class SuperAdminApiDocumentationDecorator {
  static apply(key: string, description?: string) {
    let summary;
    const badRequestResponse = swaggerUtils.badRequestResponse();

    switch (key) {
      case 'saCreateUser':
        summary = 'Super admin to add a new user to the system';
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
        // If no key matches, return an empty set of swagger
        return applyDecorators();
    }
  }
}
