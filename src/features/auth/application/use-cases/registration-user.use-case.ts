import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { RegDataDto } from '../../../users/dto/reg-data.dto';
import * as uuid4 from 'uuid4';
import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/use-cases/create-user.use-case';
import { EmailsConfirmCodeEntity } from '../../../mails/entities/emails-confirm-code.entity';
import { TablesUsersWithIdEntity } from '../../../users/entities/tables-user-with-id.entity';

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
  ): Promise<TablesUsersWithIdEntity> {
    const newUser: TablesUsersWithIdEntity = await this.commandBus.execute(
      new CreateUserCommand(command.createUserDto, command.registrationData),
    );

    const newConfirmationCode: EmailsConfirmCodeEntity = {
      codeId: uuid4().toString(),
      email: newUser.email,
      confirmationCode: newUser.confirmationCode,
      expirationDate: newUser.expirationDate,
      createdAt: new Date().toISOString(),
    };

    await this.mailsRawSqlRepository.createEmailConfirmCode(
      newConfirmationCode,
    );
    return newUser;
  }
}
