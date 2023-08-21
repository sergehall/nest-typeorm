import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../dto/create-user.dto';
import { RegDataDto } from '../../dto/reg-data.dto';
import { RegistrationUserCommand } from '../../../auth/application/use-cases/registration-user.use-case';
import { OrgIdEnums } from '../../enums/org-id.enums';
import { ExpirationDateCalculator } from '../../../../common/helpers/expiration-date-calculator';
import { EncryptConfig } from '../../../../config/encrypt/encrypt-config';
import { UserRolesEnums } from '../../../../ability/enums/user-roles.enums';
import { UsersRepo } from '../../infrastructure/users-repo';
import { UserType } from '../../types/users.type';
import { Users } from '../../entities/users.entity';
import * as uuid4 from 'uuid4';

export class CreateUserCommand {
  constructor(
    public createUserDto: CreateUserDto,
    public registrationData: RegDataDto,
  ) {}
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
  async execute(command: CreateUserCommand): Promise<Users> {
    const { login, email, password } = command.createUserDto;
    const { ip, userAgent } = command.registrationData;

    // Hash the user's password
    const passwordHash = await this.encryptConfig.getPasswordHash(password);

    // Return the expirationDate in ISO format for user registration.
    const expirationDate = await this.expirationDateCalculator.createExpDate(
      0,
      2,
      0,
    );

    // Prepare the user object with the necessary properties

    const newUser: UserType = {
      login: login.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      orgId: OrgIdEnums.IT_INCUBATOR,
      roles: [UserRolesEnums.USER],
      isBanned: false,
      banDate: null,
      banReason: null,
      confirmationCode: uuid4().toString(),
      expirationDate: expirationDate,
      isConfirmed: false,
      isConfirmedDate: null,
      ip: ip,
      userAgent: userAgent,
    };

    // return await this.usersRawSqlRepository.createUser(newUser);
    return await this.usersRepo.createUser(newUser);
  }
}
