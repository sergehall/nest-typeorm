import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { NewPasswordRecoveryDto } from '../../dto/new-password-recovery.dto';
import { EncryptConfig } from '../../../../config/encrypt/encrypt-config';

export class ChangePasswordByRecoveryCodeCommand {
  constructor(public newPasswordRecoveryDto: NewPasswordRecoveryDto) {}
}

@CommandHandler(ChangePasswordByRecoveryCodeCommand)
export class ChangePasswordByRecoveryCodeUseCase
  implements ICommandHandler<ChangePasswordByRecoveryCodeCommand>
{
  constructor(
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected encryptConfig: EncryptConfig,
  ) {}
  async execute(
    command: ChangePasswordByRecoveryCodeCommand,
  ): Promise<boolean> {
    const { newPassword, recoveryCode } = command.newPasswordRecoveryDto;

    const passwordHash = await this.encryptConfig.getPasswordHash(newPassword);

    return await this.usersRawSqlRepository.updateUserPasswordHashByRecoveryCode(
      recoveryCode,
      passwordHash,
    );
  }
}
