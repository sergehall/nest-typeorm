import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { RegDataDto } from '../../../users/dto/reg-data.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user.use-case';
import { MailsService } from '../../../../mails/application/mails.service';
import { UsersEntity } from '../../../users/entities/users.entity';
import { UserIdEmailLoginDto } from '../../dto/profile.dto';

export class RegistrationUserCommand {
  constructor(
    public createUserDto: CreateUserDto,
    public registrationData: RegDataDto,
  ) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    protected mailsService: MailsService,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: RegistrationUserCommand,
  ): Promise<UserIdEmailLoginDto> {
    const { createUserDto, registrationData } = command;
    const {} = registrationData;

    const newUser: UsersEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto, registrationData),
    );

    await this.mailsService.sendConfirmationCode(newUser);

    const { userId, login, email } = newUser;
    return { userId, login, email };
  }
}
