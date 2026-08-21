import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApiValidationErrorResponseDto } from '../dto/api-error-response.dto';

type ApiImageUploadOptions = {
  readonly width: number;
  readonly height: number;
  readonly maxSize: number;
};

export function ApiImageUpload(options: ApiImageUploadOptions): MethodDecorator {
  const maxSizeKb = Math.round(options.maxSize / 1024);

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: `PNG or JPEG image. Maximum ${maxSizeKb} KB; required dimensions ${options.width}×${options.height}px.`,
      schema: {
        type: 'object',
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Image file encoded as multipart form data.',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'The file is missing or violates the MIME type, size, or dimensions contract.',
      type: ApiValidationErrorResponseDto,
    }),
  );
}
