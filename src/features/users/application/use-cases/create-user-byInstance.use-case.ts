import { CreateUserDto } from '../../dto/create-user.dto';
import { RegDataDto } from '../../dto/reg-data.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationUserCommand } from '../../../auth/application/use-cases/registration-user.use-case';
import { TablesUsersEntityWithId } from '../../entities/userRawSqlWithId.entity';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { TablesUsersEntity } from '../../entities/tablesUsers.entity';
import { OrgIdEnums } from '../../enums/org-id.enums';
import { RolesEnums } from '../../../../ability/enums/roles.enums';
import * as uuid4 from 'uuid4';
import { getConfiguration } from '../../../../config/configuration';
import * as bcrypt from 'bcrypt';

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
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(command: CreateUserCommand): Promise<TablesUsersEntityWithId> {
    const { login, email, password } = command.createUserDto;
    const { ip, userAgent } = command.registrationData;

    // Hash the user's password
    const passwordHash = await this.hashPassword(password);

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
      // 3 hours 65 min
      expirationDate: new Date(Date.now() + 3 * 65 * 60 * 1000).toISOString(),
      isConfirmed: false,
      isConfirmedDate: null,
      ip: ip,
      userAgent: userAgent,
    };

    // Call the usersRawSqlRepository method to createUser and return result.
    return await this.usersRawSqlRepository.createUser(newUser);
  }
  private async hashPassword(password: string): Promise<string> {
    const saltFactor = Number(getConfiguration().bcrypt.SALT_FACTOR);
    const salt = await bcrypt.genSalt(saltFactor);
    return bcrypt.hash(password, salt);
  }
}
