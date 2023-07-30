import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../dto/create-user.dto';
import { RegDataDto } from '../../dto/reg-data.dto';
import { RegistrationUserCommand } from '../../../auth/application/use-cases/registration-user.use-case';
import { TablesUsersEntityWithId } from '../../entities/userRawSqlWithId.entity';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { TablesUsersEntity } from '../../entities/tablesUsers.entity';
import { OrgIdEnums } from '../../enums/org-id.enums';
import { RolesEnums } from '../../../../ability/enums/roles.enums';
import { ExpirationDateCalculator } from '../../../common/calculator/expiration-date-calculator';
import { EncryptConfig } from '../../../../config/encrypt/encrypt-config';
import * as uuid4 from 'uuid4';

export class CreateUserCommand {
  constructor(
    public createUserDto: CreateUserDto,
    public registrationData: RegDataDto,
  ) {}
}
@CommandHandler(CreateUserCommand)
export class CreateUserByInstanceUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
    private readonly expirationDateCalculator: ExpirationDateCalculator,
    private readonly encryptConfig: EncryptConfig,
  ) {}
  async execute(command: CreateUserCommand): Promise<TablesUsersEntityWithId> {
    const { login, email, password } = command.createUserDto;
    const { ip, userAgent } = command.registrationData;

    // Hash the user's password
    const passwordHash = await this.encryptConfig.getHashPassword(password);

    // Return the expirationDate in ISO format
    const expirationDate = await this.expirationDateCalculator.createExpDate(
      0,
      2,
      0,
    );

    // Prepare the user object with the necessary properties
    const newUser: TablesUsersEntity = {
      login: login.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      orgId: OrgIdEnums.IT_INCUBATOR,
      roles: RolesEnums.USER,
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

    // Call the usersRawSqlRepository method to createUser and return result.
    return await this.usersRawSqlRepository.createUser(newUser);
  }
  // private async hashPassword(password: string): Promise<string> {
  //   const saltFactor = Number(
  //     Configuration.getConfiguration().bcrypt.SALT_FACTOR,
  //   );
  //   const salt = await bcrypt.genSalt(saltFactor);
  //   return bcrypt.hash(password, salt);
  // }
}
