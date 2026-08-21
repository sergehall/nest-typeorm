import { IsString, IsEmail } from 'class-validator';

export class ConfirmationCodeEmailOptions {
  @IsEmail()
  to: string;

  @IsEmail()
  from: string;

  @IsString()
  subject: string;

  @IsString()
  text: string;

  @IsString()
  html: string;
}
