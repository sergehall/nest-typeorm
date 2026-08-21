import { ApiProperty } from '@nestjs/swagger';

export class ApiFieldErrorDto {
  @ApiProperty({
    description: 'Human-readable validation failure.',
    example: 'Value must contain between 3 and 10 characters.',
  })
  message: string;

  @ApiProperty({
    description: 'Request field associated with the validation failure.',
    example: 'login',
  })
  field: string;
}

export class ApiValidationErrorResponseDto {
  @ApiProperty({
    description: 'Validation or authentication failures returned by the global exception filter.',
    type: [ApiFieldErrorDto],
  })
  errorsMessages: ApiFieldErrorDto[];
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({
    description: 'Human-readable error details.',
    oneOf: [
      { type: 'string', example: 'Resource not found' },
      { type: 'array', items: { type: 'object', additionalProperties: true } },
    ],
  })
  message: unknown;

  @ApiProperty({
    description: 'Error creation time in ISO 8601 format.',
    example: '2026-08-20T19:58:10.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path that produced the error.',
    example: '/posts/missing-post-id',
  })
  path: string;
}
