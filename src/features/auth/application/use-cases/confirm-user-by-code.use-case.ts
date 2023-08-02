import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { codeIncorrect } from '../../../../exception-filter/custom-errors-messages';

export class ConfirmUserByCodeCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmUserByCodeCommand)
export class ConfirmUserByCodeUseCase
  implements ICommandHandler<ConfirmUserByCodeCommand>
{
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(command: ConfirmUserByCodeCommand): Promise<boolean> {
    const { code } = command;
    const currentDate = new Date().toISOString();

    const userToUpdateConfirmCode =
      await this.usersRawSqlRepository.findUserByConfirmationCode(code);

    if (
      !userToUpdateConfirmCode ||
      userToUpdateConfirmCode.isConfirmed ||
      (!userToUpdateConfirmCode.isConfirmed &&
        userToUpdateConfirmCode.expirationDate <= currentDate)
    ) {
      throw new HttpException(
        { message: [codeIncorrect] },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.usersRawSqlRepository.confirmUserByConfirmCode(
        code,
        true,
        currentDate,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
