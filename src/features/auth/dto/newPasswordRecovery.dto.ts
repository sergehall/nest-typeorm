import { IsNotEmpty, Length, MaxLength, Validate } from 'class-validator';
import { RecoveryCodeExistsRule } from '../../../pipes/recoveryCodeExistsRule-validation';

export class NewPasswordRecoveryDto {
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Incorrect newPassword length! Must be min 6, max 20 ch.',
  })
  newPassword: string;
  @IsNotEmpty()
  @MaxLength(100, {
    message: 'Incorrect recoveryCode length! Must be max 100 ch.',
  })
  @Validate(RecoveryCodeExistsRule)
  recoveryCode: string;
}
