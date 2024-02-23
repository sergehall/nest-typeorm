import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ImageMetadata {
  @IsNotEmpty()
  @IsString()
  url: string = '';

  @IsNotEmpty()
  @IsNumber()
  width: number = 0;

  @IsNotEmpty()
  @IsNumber()
  height: number = 0;

  @IsNotEmpty()
  @IsNumber()
  fileSize: number;
}
