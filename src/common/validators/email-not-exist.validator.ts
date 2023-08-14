import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UsersRawSqlRepository } from '../../features/users/infrastructure/users-raw-sql.repository';
import { TablesUsersWithIdEntity } from '../../features/users/entities/tables-user-with-id.entity';

@ValidatorConstraint({ name: 'EmailNotExistValidator', async: true })
@Injectable()
export class EmailNotExistValidator implements ValidatorConstraintInterface {
  constructor(private readonly usersRawSqlRepository: UsersRawSqlRepository) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Don't perform validation if value is not provided
    }

    const user: TablesUsersWithIdEntity[] =
      await this.usersRawSqlRepository.loginOrEmailAlreadyExist(value);

    return (
      user[0] &&
      !user[0].isConfirmed &&
      user[0].expirationDate > new Date().toISOString()
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `User with '${args.value}'not exist or already confirmed.`;
  }
}
