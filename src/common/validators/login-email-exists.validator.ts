import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UsersRepo } from '../../features/users/infrastructure/users-repo';

@Injectable()
@ValidatorConstraint({ name: 'LoginEmailExistsValidator', async: true })
export class LoginEmailExistsValidator implements ValidatorConstraintInterface {
  constructor(protected usersRepo: UsersRepo) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Don't perform validation if value is not provided
    }

    const user = await this.usersRepo.loginOrEmailAlreadyExist(value);
    return !user;
  }

  defaultMessage(args: ValidationArguments): string {
    console.log(`User with '${args.value}' already exists.`);
    return `User with '${args.value}' already exists.`;
  }
}
