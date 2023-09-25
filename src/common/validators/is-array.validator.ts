import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsArrayValidator', async: true })
@Injectable()
export class IsArrayValidator implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    return !(!Array.isArray(value) || value.length === 0);
  }

  defaultMessage(args: ValidationArguments): string {
    console.log(
      `Correct answers must be an array of at least one string. "correctAnswers:'${args.value}'"`,
    );
    return `Correct answers must be an array of at least one string.`;
  }
}
