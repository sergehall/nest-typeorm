import { CreateUserDto } from '../../../users/dto/create-user.dto';
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user.use-case';
import { UsersEntity } from '../../../users/entities/users.entity';
import { UserViewModel } from '../../../users/view-models/user.view-model';

export class RegistrationUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(protected commandBus: CommandBus, protected eventBus: EventBus) {}
  async execute(command: RegistrationUserCommand): Promise<UserViewModel> {
    const { createUserDto } = command;

    const newUser: UsersEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
    );

    newUser.events.forEach((e) => {
      this.eventBus.publish(e);
    });

    return {
      id: newUser.userId,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }
}
