import { IsNumber } from 'class-validator';

export class ImageWidthHeightSize {
  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  fileSize: number;
}
