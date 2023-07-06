import { CreateUserDto } from '../../dto/create-user.dto';
import { RegDataDto } from '../../dto/reg-data.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationUserCommand } from '../../../auth/application/use-cases/registration-user.use-case';
import { UsersService } from '../users.service';
import { UserRawSqlWithIdEntity } from '../../entities/userRawSqlWithId.entity';

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
  constructor(protected usersService: UsersService) {}
  async execute(command: CreateUserCommand): Promise<UserRawSqlWithIdEntity> {
    return await this.usersService.createUsers(
      command.createUserDto,
      command.registrationData,
    );
  }
}
