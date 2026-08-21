import { FileUploadDto } from '../../blogger-blogs/dto/file-upload.dto';
import { IsDefined } from 'class-validator';

export class ResizedImageDetailsDto {
  @IsDefined({ message: 'Fieldname is required' })
  original: FileUploadDto;
  @IsDefined({ message: 'Fieldname is required' })
  middle: FileUploadDto;
  @IsDefined({ message: 'Fieldname is required' })
  small: FileUploadDto;
}
