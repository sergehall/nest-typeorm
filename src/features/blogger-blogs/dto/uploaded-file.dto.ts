import { IsNotEmpty, IsString } from 'class-validator';

export class UrlEtagDto {
  @IsNotEmpty({ message: 'URL must not be empty' })
  @IsString({ message: 'URL must be a string' })
  url: string;

  @IsNotEmpty({ message: 'eTag must not be empty' })
  @IsString({ message: 'eTag must be a string' })
  eTag: string;
}
