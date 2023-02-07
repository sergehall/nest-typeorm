import { CreateUserDto } from '../../dto/create-user.dto';
import { RegDataDto } from '../../dto/reg-data.dto';
import { UsersDocument } from '../../infrastructure/schemas/user.schema';
import { EmailConfimCodeEntity } from '../../../mails/entities/email-confim-code.entity';
import * as uuid4 from 'uuid4';
import { MailsRepository } from '../../../mails/infrastructure/mails.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './createUserByInstanceUseCase';

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
    protected mailsRepository: MailsRepository,
    private commandBus: CommandBus,
  ) {}
  async execute(command: RegistrationUserCommand): Promise<UsersDocument> {
    const newInstance = await this.commandBus.execute(
      new CreateUserCommand(command.createUserDto, command.registrationData),
    );
    const newConfirmationCode: EmailConfimCodeEntity = {
      id: uuid4().toString(),
      email: newInstance.email,
      confirmationCode: newInstance.emailConfirmation.confirmationCode,
      createdAt: new Date().toISOString(),
    };
    await this.mailsRepository.createEmailConfirmCode(newConfirmationCode);
    return newInstance;
  }
}
