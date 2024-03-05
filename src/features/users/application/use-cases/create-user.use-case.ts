import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../dto/create-user.dto';
import { RegistrationUserCommand } from '../../../auth/application/use-cases/registration-user.use-case';
import { EncryptConfig } from '../../../../config/encrypt/encrypt.config';
import { UsersRepo } from '../../infrastructure/users-repo';
import { DataForCreateUserDto } from '../../dto/data-for-create-user.dto';
import { UsersEntity } from '../../entities/users.entity';
import { ExpirationDateDto } from '../../../../common/helpers/calculator-expiration-date/dto/expiration-date.dto';
import { CalculatorExpirationDate } from '../../../../common/helpers/calculator-expiration-date/calculator-expiration-date';

export class CreateUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly expirationDateCalculator: CalculatorExpirationDate,
    private readonly usersRepo: UsersRepo,
    private readonly encryptConfig: EncryptConfig,
  ) {}
  async execute(command: CreateUserCommand): Promise<UsersEntity> {
    const { login, email, password } = command.createUserDto;

    // Hash the user's password
    const passwordHash = await this.encryptConfig.encryptPassword(password);

    // Return the expirationDate in ISO format for user registration.
    const expirationDateDto: ExpirationDateDto =
      await this.expirationDateCalculator.createExpDate(0, 2, 0);

    const dataForCreateUserDto: DataForCreateUserDto = {
      login,
      email,
      passwordHash,
      expirationDate: expirationDateDto.expirationDate,
    };

    return await this.usersRepo.createUser(dataForCreateUserDto);
  }
}
