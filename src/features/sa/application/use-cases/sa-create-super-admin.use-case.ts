import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { DataForCreateUserDto } from '../../../users/dto/data-for-create-user.dto';
import { UsersEntity } from '../../../users/entities/users.entity';
import { ExpirationDateDto } from '../../../../common/helpers/calculator-expiration-date/dto/expiration-date.dto';
import { CalculatorExpirationDate } from '../../../../common/helpers/calculator-expiration-date/calculator-expiration-date';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaConfig } from '../../../../config/sa/sa.config';

export class CreateSaUserCommand {}

@CommandHandler(CreateSaUserCommand)
export class CreateSaUserUseCase
  implements ICommandHandler<CreateSaUserCommand>
{
  constructor(
    private readonly saConfig: SaConfig,
    private readonly usersRepo: UsersRepo,
    private readonly expirationDateCalculator: CalculatorExpirationDate,
  ) {}

  async execute(): Promise<UsersEntity> {
    const [saLogin, saEmail, saPasswordHash] = await Promise.all([
      this.saConfig.getSaValue('SA_LOGIN'),
      this.saConfig.getSaValue('SA_EMAIL'),
      this.saConfig.getSaValue('SA_PASSWORD_HASH'),
    ]);

    // Return the expirationDate in ISO format for user registration.
    const expirationDateDto: ExpirationDateDto =
      await this.expirationDateCalculator.createExpDate(5, 0, 0);

    const dataForCreateUserDto: DataForCreateUserDto = {
      login: saLogin,
      email: saEmail,
      passwordHash: saPasswordHash,
      expirationDate: expirationDateDto.expirationDate,
    };

    return await this.usersRepo.createSaUser(dataForCreateUserDto);
  }
}
