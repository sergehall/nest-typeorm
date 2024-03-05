import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordRecoveryDto } from '../../dto/new-password-recovery.dto';
import { EncryptConfig } from '../../../../config/encrypt/encrypt.config';
import { UsersRepo } from '../../../users/infrastructure/users-repo';

export class ChangePasswordByRecoveryCodeCommand {
  constructor(public newPasswordRecoveryDto: NewPasswordRecoveryDto) {}
}

@CommandHandler(ChangePasswordByRecoveryCodeCommand)
export class ChangePasswordByRecoveryCodeUseCase
  implements ICommandHandler<ChangePasswordByRecoveryCodeCommand>
{
  constructor(
    protected usersRepo: UsersRepo,
    protected encryptConfig: EncryptConfig,
  ) {}
  async execute(
    command: ChangePasswordByRecoveryCodeCommand,
  ): Promise<boolean> {
    const { newPassword, recoveryCode } = command.newPasswordRecoveryDto;

    const passwordHash = await this.encryptConfig.encryptPassword(newPassword);

    return await this.usersRepo.updateUserPasswordHashByRecoveryCode(
      recoveryCode,
      passwordHash,
    );
  }
}
