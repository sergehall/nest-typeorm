import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRawSqlRepository } from '../../features/users/infrastructure/users-raw-sql.repository';

@ValidatorConstraint({ name: 'RecoveryCodeExists', async: true })
@Injectable()
export class RecoveryCodeExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly usersRawSqlRepository: UsersRawSqlRepository) {}

  async validate(value: string): Promise<boolean> {
    try {
      const user = await this.usersRawSqlRepository.findUserByConfirmationCode(
        value,
      );
      return !!user;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `User with recoveryCode: ${args.value} doesn't exist`;
  }
}
