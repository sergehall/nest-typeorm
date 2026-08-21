import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserIdEmailLoginDto {
  @ApiProperty({
    type: String,
    example: 'my-email@gmail.com',
    description: 'User email',
  })
  @IsNotEmpty()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  @ApiProperty({ type: String, example: 'my-login', description: 'User login' })
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  login: string;
  @ApiProperty({
    type: String,
    example: 'f0f56ed1-a02d-40c6-a7e8-ea5b0f0008fd',
    description: 'User ID',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 50, {
    message: 'Incorrect userId length! Must be max 50 ch.',
  })
  userId: string;
}
