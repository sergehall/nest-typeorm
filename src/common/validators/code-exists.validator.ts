import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRawSqlRepository } from '../../features/users/infrastructure/users-raw-sql.repository';
import { TablesUsersWithIdEntity } from '../../features/users/entities/tables-user-with-id.entity';

@ValidatorConstraint({ name: 'CodeExistsValidator', async: true })
@Injectable()
export class CodeExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly usersRawSqlRepository: UsersRawSqlRepository) {}

  async validate(value: string): Promise<boolean> {
    try {
      const user: TablesUsersWithIdEntity | null =
        await this.usersRawSqlRepository.findUserByConfirmationCode(value);

      return (
        !user ||
        user.isConfirmed ||
        (!user.isConfirmed && user.expirationDate < new Date().toISOString())
      );
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `User with code: ${args.value} doesn't exist`;
  }
}
