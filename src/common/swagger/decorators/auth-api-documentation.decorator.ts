import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserIdEmailLoginDto } from '../../../features/auth/dto/profile.dto';

export class AuthApiDocumentationDecorator {
  static apply(key: string, description?: string) {
    let summary;

    switch (key) {
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

      default:
        // If no key matches, return an empty set of swagger
        return applyDecorators();
    }
  }
}
