import { CreateUserDto } from '../../dto/create-user.dto';
import { RegDataDto } from '../../dto/reg-data.dto';
import { UsersDocument } from '../../infrastructure/schemas/user.schema';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationUserCommand } from '../../../auth/application/use-cases/registration-user.use-case';
import { UsersService } from '../users.service';

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
    private usersRepository: UsersRepository,
    protected usersService: UsersService,
  ) {}
  async execute(command: CreateUserCommand): Promise<UsersDocument> {
    const createUser = await this.usersService.createUsers(
      command.createUserDto,
      command.registrationData,
    );
    const newInstance = await this.usersRepository.makeInstanceUser(
      command.createUserDto,
      command.registrationData,
    );
    await this.usersRepository.save(newInstance);
    return newInstance;
  }
}
