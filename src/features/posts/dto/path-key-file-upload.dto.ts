import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { FileUploadDto } from '../../blogger-blogs/dto/file-upload.dto';
import { Type } from 'class-transformer';

export class PathKeyFileUploadDto {
  @IsDefined()
  @IsString()
  pathKey: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => FileUploadDto)
  fileUploadDto: FileUploadDto;
}
