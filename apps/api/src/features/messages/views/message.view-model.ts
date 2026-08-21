import { ApiProperty } from '@nestjs/swagger';

export class MessageViewModel {
  @ApiProperty({
    format: 'uuid',
    example: 'a1958e65-7352-45d5-bf72-7993f51a0698',
    description: 'Message identifier.',
  })
  id: string;

  @ApiProperty({
    example: 'Hello from NestLab!',
    description: 'Message content.',
  })
  content: string;

  @ApiProperty({
    format: 'date-time',
    example: '2026-08-20T19:24:10.000Z',
    description: 'UTC creation timestamp.',
  })
  createdAt: string;
}
