// type allowedExtensions = '.png' | '.jpg' | '.jpeg';

export type FileValidationOptions = {
  maxSize: number;
  allowedExtensions: string[];
  maxWidth: number;
  maxHeight: number;
};
