import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { userAlreadyExists } from '../../../../exception-filter/custom-errors-messages';

export class CheckingUserExistenceCommand {
  constructor(public login: string, public email: string) {}
}

@CommandHandler(CheckingUserExistenceCommand)
export class CheckingUserExistenceUseCase
  implements ICommandHandler<CheckingUserExistenceCommand>
{
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(command: CheckingUserExistenceCommand): Promise<boolean> {
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
