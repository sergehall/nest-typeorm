import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';
import { AllowedExtensions } from './enums/allowed-extensions.enums';

export class FileConstraintsDto {
  @IsNumber()
  maxSize: number;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(LikeStatusEnums, {
    message: 'Incorrect extensions must be type of Png, Jpg or Jpeg.',
  })
  allowedExtensions: AllowedExtensions[] = [
    AllowedExtensions.PNG,
    AllowedExtensions.JPG,
    AllowedExtensions.JPEG,
  ]; // Set default value

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;
}

export type FileConstraints = {
  imagePost: FileConstraintsDto;
  imageBlogWallpaper: FileConstraintsDto;
  imageBlogMain: FileConstraintsDto;
};
