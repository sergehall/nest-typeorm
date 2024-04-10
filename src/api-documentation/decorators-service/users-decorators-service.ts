import { applyDecorators, HttpStatus, Injectable } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBasicAuth,
} from '@nestjs/swagger';
import { UserViewModel } from '../../features/users/views/user.view-model';
import { swaggerUtils } from '../utils/swagger.utils';
import { UsersMethods } from '../enums/users-methods.enum';

@Injectable()
export class UsersDecoratorsService {
  static getDecorator(method: string, description?: string) {
    let summary;
    const badRequestResponse = swaggerUtils.badRequestResponse();

    switch (method) {
      case UsersMethods.CreateUser:
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
        // If no key matches, return an empty set of swagger
        return applyDecorators();
    }
  }
}
