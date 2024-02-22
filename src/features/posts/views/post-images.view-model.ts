import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ImageMetadata {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsNumber()
  width: number;

  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsNotEmpty()
  @IsNumber()
  fileSize: number;
}

export class PostImagesViewModel {
  main: ImageMetadata[] = []; // Set default value
}
