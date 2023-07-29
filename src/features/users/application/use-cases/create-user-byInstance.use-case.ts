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
import * as bcrypt from 'bcrypt';
import Configuration from '../../../../config/configuration';

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

    // Return the expirationDate in ISO format
    const expirationDate = this.createExpirationDate(0, 2, 0);

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
  private async hashPassword(password: string): Promise<string> {
    const saltFactor = Number(
      Configuration.getConfiguration().bcryptConfig.SALT_FACTOR,
    );
    const salt = await bcrypt.genSalt(saltFactor);
    return bcrypt.hash(password, salt);
  }

  // Function to calculate the expiration date
  private createExpirationDate(
    days: number,
    hours: number,
    minutes: number,
  ): string {
    // Convert days, hours, and minutes to milliseconds
    const daysInMilliseconds: number = days * 24 * 60 * 60 * 1000;
    const hoursInMilliseconds: number = hours * 60 * 60 * 1000;
    const minutesInMilliseconds: number = minutes * 60 * 1000;

    // Calculate the total time in milliseconds
    const totalTimeInMilliseconds: number =
      daysInMilliseconds + hoursInMilliseconds + minutesInMilliseconds;

    // Get the current date and time
    const currentDate: Date = new Date();

    // Calculate the future date by adding the total time
    const futureDate: Date = new Date(
      currentDate.getTime() + totalTimeInMilliseconds,
    );

    // Return the future date in ISO format
    return futureDate.toISOString();
  }
}
