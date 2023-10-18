import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepo } from '../../features/users/infrastructure/users-repo';

@ValidatorConstraint({ name: 'CodeExistsValidator', async: true })
@Injectable()
export class CodeExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly usersRepo: UsersRepo) {}

  async validate(value: string): Promise<boolean> {
    return await this.usersRepo.findUserByConfirmationCode(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `User with code: ${args.value} doesn't exist or already confirmed.`;
  }
}
