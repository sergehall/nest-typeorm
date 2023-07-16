import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { RegDataDto } from '../../../users/dto/reg-data.dto';
import { EmailConfimCodeEntity } from '../../../mails/entities/email-confim-code.entity';
import * as uuid4 from 'uuid4';
import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user-byInstance.use-case';
import { TablesUsersEntityWithId } from '../../../users/entities/userRawSqlWithId.entity';

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
    protected mailsRawSqlRepository: MailsRawSqlRepository,
    private commandBus: CommandBus,
  ) {}
  async execute(
    command: RegistrationUserCommand,
  ): Promise<TablesUsersEntityWithId> {
    const newUser: TablesUsersEntityWithId = await this.commandBus.execute(
      new CreateUserCommand(command.createUserDto, command.registrationData),
    );
    const newConfirmationCode: EmailConfimCodeEntity = {
      id: uuid4().toString(),
      email: newUser.email,
      confirmationCode: newUser.confirmationCode,
      createdAt: new Date().toISOString(),
    };
    await this.mailsRawSqlRepository.createEmailConfirmCode(
      newConfirmationCode,
    );
    return newUser;
  }
}
