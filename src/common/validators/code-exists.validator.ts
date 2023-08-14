import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRawSqlRepository } from '../../features/users/infrastructure/users-raw-sql.repository';

@ValidatorConstraint({ name: 'CodeExistsValidator', async: true })
@Injectable()
export class CodeExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly usersRawSqlRepository: UsersRawSqlRepository) {}

  async validate(value: string): Promise<boolean> {
    return await this.usersRawSqlRepository.findUserByConfirmationCode(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `User with code: ${args.value} doesn't exist`;
  }
}
