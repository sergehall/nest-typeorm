import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Account login or email address.',
    example: 'student@example.com',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  loginOrEmail: string;

  @ApiProperty({
    description: 'Account password.',
    example: 'StrongPassword123!',
    minLength: 6,
    maxLength: 20,
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}
