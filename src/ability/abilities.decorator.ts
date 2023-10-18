import { SetMetadata } from '@nestjs/common';
import { Action } from './roles/action.enum';
import { Subject } from '@casl/ability';
import { CurrentUserDto } from '../features/users/dto/current-user.dto';

export interface RequiredRule {
  action: Action;
  subject: Subject;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);

export class ReadUserAbility implements RequiredRule {
  action = Action.READ;
  subject = CurrentUserDto;
}

// example in Controller under the decorator @Post, @Get, ...
// @Post
// @UseGuards(AbilitiesGuard)
//@CheckAbilities(new ReadUserAbility())
