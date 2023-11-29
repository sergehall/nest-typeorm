import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  fileNotProvided,
  fileSizeLimit,
  invalidFileExtension,
  invalidImageDimensions,
} from '../filters/custom-errors-messages';
import * as sharp from 'sharp';
import { FileDto } from '../../features/blogger-blogs/dto/file-upload.dto';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<FileDto> {
    const constraints = {
      maxSize: 100 * 1024, // 100KB
      allowedExtensions: ['.png', '.jpg', '.jpeg'],
      maxWidth: 940,
      maxHeight: 432,
    };

    const errorMessage = [];

    if (!value) {
      errorMessage.push(fileNotProvided);
    }

    if (value.size > constraints.maxSize) {
      errorMessage.push(fileSizeLimit);
    }

    if (
      !constraints.allowedExtensions.includes(
        '.' + value.mimetype.split('/').pop(),
      )
    ) {
      errorMessage.push(invalidFileExtension);
    }

    try {
      // Use sharp to read image metadata (including dimensions)
      const metadata = await sharp(value.buffer).metadata();
      if (
        !metadata.width ||
        metadata.width > constraints.maxWidth ||
        !metadata.height ||
        metadata.height > constraints.maxHeight
      ) {
        errorMessage.push(invalidImageDimensions);
      }
    } catch (error) {
      // Handle any sharp-related errors
      throw new HttpException(
        { message: 'Error reading image metadata' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (errorMessage.length > 0) {
      throw new HttpException(
        { message: errorMessage },
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }
}
