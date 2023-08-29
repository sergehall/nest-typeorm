import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user.use-case';
import { MailsService } from '../../../../mails/application/mails.service';
import { UsersEntity } from '../../../users/entities/users.entity';
import { UserIdEmailLoginDto } from '../../dto/profile.dto';

export class RegistrationUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
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
    const { createUserDto } = command;

    const newUser: UsersEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
    );

    await this.mailsService.sendConfirmationCode(newUser);

    const { userId, login, email } = newUser;
    return { userId, login, email };
  }
}
