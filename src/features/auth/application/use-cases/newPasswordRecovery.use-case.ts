import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { NewPasswordRecoveryDto } from '../../dto/newPasswordRecovery.dto';
import * as bcrypt from 'bcrypt';
import { getConfiguration } from '../../../../config/configuration';

export class newPasswordRecoveryCommand {
  constructor(public newPasswordRecoveryDto: NewPasswordRecoveryDto) {}
}

@CommandHandler(newPasswordRecoveryCommand)
export class newPasswordRecoveryUseCase
  implements ICommandHandler<newPasswordRecoveryCommand>
{
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(command: newPasswordRecoveryCommand): Promise<boolean> {
    const { newPassword, recoveryCode } = command.newPasswordRecoveryDto;
    const user = await this.usersRawSqlRepository.findUserByConfirmationCode(
      recoveryCode,
    );
    if (!user) {
      return false;
    }
    const saltFactor = Number(getConfiguration().bcrypt.SALT_FACTOR);
    const passwordHash = await bcrypt.hash(newPassword, saltFactor);
    await this.usersRawSqlRepository.updateUserPasswordHash(
      user.id,
      passwordHash,
    );

    return true;
  }
}
