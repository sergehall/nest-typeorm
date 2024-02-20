import { IsDefined } from 'class-validator';

export class KeysPathDto {
  @IsDefined({ message: 'Fieldname is required' })
  original: string;
  @IsDefined({ message: 'Fieldname is required' })
  middle: string;
  @IsDefined({ message: 'Fieldname is required' })
  small: string;
}
