import { CreateUserDto } from '../../../users/dto/create-user.dto';
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user.use-case';
import { UsersEntity } from '../../../users/entities/users.entity';
import { UserViewModel } from '../../../users/views/user.view-model';
import { RegistrationUserEvent } from '../../../users/events/registration-user.event';

export class RegistrationUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected eventBus: EventBus,
  ) {}
  async execute(command: RegistrationUserCommand): Promise<UserViewModel> {
    const { createUserDto } = command;

    const newUser: UsersEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
    );

    const event: RegistrationUserEvent = new RegistrationUserEvent(newUser);
    newUser.events.push(event);

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
