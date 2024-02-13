import { FileConstraints } from './file-constraints.dto';
import { AllowedExtensions } from './enums/allowed-extensions.enums';

export const getFileConstraints: FileConstraints = {
  imageBlogWallpaper: {
    maxSize: 100 * 1024, // 100KB
    allowedExtensions: [
      AllowedExtensions.JPEG,
      AllowedExtensions.JPG,
      AllowedExtensions.PNG,
    ],
    maxWidth: 1028,
    maxHeight: 312,
  },
  imagePost: {
    maxSize: 100 * 1024, // 100KB
    allowedExtensions: [
      AllowedExtensions.JPEG,
      AllowedExtensions.JPG,
      AllowedExtensions.PNG,
    ],
    maxWidth: 940,
    maxHeight: 432,
  },
};
