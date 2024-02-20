import { IsDefined, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UrlPathKeyEtagDto {
  @IsNotEmpty({ message: 'URL must not be empty' })
  @IsString({ message: 'URL must be a string' })
  @IsUrl()
  url: string;

  @IsNotEmpty({ message: 'PathKey must not be empty' })
  @IsString({ message: 'PathKey must be a string' })
  pathKey: string;

  @IsNotEmpty({ message: 'eTag must not be empty' })
  @IsString({ message: 'eTag must be a string' })
  eTag: string;
}

export class UrlsPathKeysEtagsDto {
  @IsDefined({ message: 'Fieldname is required' })
  original: UrlPathKeyEtagDto;
  @IsDefined({ message: 'Fieldname is required' })
  middle: UrlPathKeyEtagDto;
  @IsDefined({ message: 'Fieldname is required' })
  small: UrlPathKeyEtagDto;
}
