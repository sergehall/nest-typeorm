import { FileUploadDto } from '../../blogger-blogs/dto/file-upload.dto';

export class ResizedImageDetailsDto {
  original: FileUploadDto;
  middle: FileUploadDto;
  small: FileUploadDto;
}
