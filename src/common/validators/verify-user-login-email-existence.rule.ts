import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UsersRawSqlRepository } from '../../features/users/infrastructure/users-raw-sql.repository';

@ValidatorConstraint({ name: 'VerifyUserLoginEmailExistenceRule', async: true })
@Injectable()
export class VerifyUserLoginEmailExistenceRule
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRawSqlRepository: UsersRawSqlRepository) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Don't perform validation if value is not provided
    }

    const userIsExist =
      await this.usersRawSqlRepository.loginOrEmailAlreadyExist(value);

    return userIsExist.length === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    return `User with '${args.value}' already exists.`;
  }
}
