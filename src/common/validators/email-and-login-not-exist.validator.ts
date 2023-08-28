import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UsersRepo } from '../../features/users/infrastructure/users-repo';
import { UsersEntity } from '../../features/users/entities/users.entity';

@ValidatorConstraint({ name: 'EmailAndLoginNotExistValidator', async: true })
@Injectable()
export class EmailAndLoginNotExistValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepo: UsersRepo) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Don't perform validation if value is not provided
    }

    const user: UsersEntity | null =
      await this.usersRepo.findUserByLoginOrEmail(value);

    if (!user) {
      return false;
    }

    return (
      user &&
      !user.isConfirmed &&
      user.expirationDate > new Date().toISOString()
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `User with '${args.value}'not exist or already confirmed.`;
  }
}
