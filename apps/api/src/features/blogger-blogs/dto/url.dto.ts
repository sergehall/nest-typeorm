import { IsNotEmpty, IsUrl } from 'class-validator';

export class UrlDto {
  @IsNotEmpty({ message: 'URL must not be empty' })
  @IsUrl()
  url: string;
}
