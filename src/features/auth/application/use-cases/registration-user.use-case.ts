import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user.use-case';
import { MailsService } from '../../../../mails/application/mails.service';
import { UsersEntity } from '../../../users/entities/users.entity';
import { UserViewModel } from '../../../users/view-models/user.view-model';

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
  async execute(command: RegistrationUserCommand): Promise<UserViewModel> {
    const { createUserDto } = command;

    const newUser: UsersEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
    );

    await this.mailsService.sendConfirmationCode(newUser);

    return {
      id: newUser.userId,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }
}
