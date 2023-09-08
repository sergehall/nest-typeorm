import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../dto/create-user.dto';
import { RegistrationUserCommand } from '../../../auth/application/use-cases/registration-user.use-case';
import { ExpirationDateCalculator } from '../../../../common/helpers/expiration-date-calculator';
import { EncryptConfig } from '../../../../config/encrypt/encrypt-config';
import { UsersRepo } from '../../infrastructure/users-repo';
import { DataForCreateUserDto } from '../../dto/data-for-create-user.dto';
import { ReturnUserDto } from '../../dto/return-user.dto';

export class CreateUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly expirationDateCalculator: ExpirationDateCalculator,
    private readonly usersRepo: UsersRepo,
    private readonly encryptConfig: EncryptConfig,
  ) {}
  async execute(command: CreateUserCommand): Promise<ReturnUserDto> {
    const { login, email, password } = command.createUserDto;

    // Hash the user's password
    const passwordHash = await this.encryptConfig.getPasswordHash(password);

    // Return the expirationDate in ISO format for user registration.
    const expirationDate = await this.expirationDateCalculator.createExpDate(
      0,
      2,
      0,
    );
    const dataForCreateUserDto: DataForCreateUserDto = {
      login,
      email,
      passwordHash,
      expirationDate,
    };

    const newUser = await this.usersRepo.createUser(dataForCreateUserDto);

    return {
      id: newUser.userId,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }
}
