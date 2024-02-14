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
    width: 1028,
    height: 312,
  },
  imagePost: {
    maxSize: 100 * 1024, // 100KB
    allowedExtensions: [
      AllowedExtensions.JPEG,
      AllowedExtensions.JPG,
      AllowedExtensions.PNG,
    ],
    width: 940,
    height: 432,
  },
  imageBlogMain: {
    maxSize: 100 * 1024, // 100KB
    allowedExtensions: [
      AllowedExtensions.JPEG,
      AllowedExtensions.JPG,
      AllowedExtensions.PNG,
    ],
    width: 156,
    height: 156,
  },
};
