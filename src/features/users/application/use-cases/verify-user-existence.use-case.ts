import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { userAlreadyExists } from '../../../../exception-filter/custom-errors-messages';

export class VerifyUserExistenceCommand {
  constructor(public login: string, public email: string) {}
}

@CommandHandler(VerifyUserExistenceCommand)
export class VerifyUserExistenceUseCase
  implements ICommandHandler<VerifyUserExistenceCommand>
{
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(command: VerifyUserExistenceCommand): Promise<boolean> {
    const { login, email } = command;
    const userIsExist = await this.usersRawSqlRepository.userAlreadyExist(
      login,
      email,
    );
    if (userIsExist) {
      throw new HttpException(
        { message: [userAlreadyExists] },
        HttpStatus.BAD_REQUEST,
      );
    }
    return userIsExist;
  }
}
