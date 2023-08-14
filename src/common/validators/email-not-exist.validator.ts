import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UsersRawSqlRepository } from '../../features/users/infrastructure/users-raw-sql.repository';

@ValidatorConstraint({ name: 'EmailNotExistValidator', async: true })
@Injectable()
export class EmailNotExistValidator implements ValidatorConstraintInterface {
  constructor(private readonly usersRawSqlRepository: UsersRawSqlRepository) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Don't perform validation if value is not provided
    }

    const userNotExist =
      await this.usersRawSqlRepository.loginOrEmailAlreadyExist(value);

    return userNotExist.length !== 0;
  }

  defaultMessage(args: ValidationArguments): string {
    return `User with '${args.value}' not exists.`;
  }
}
