import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { OrgIdEnums } from '../../users/enums/org-id.enums';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import * as uuid4 from 'uuid4';

export const userSuperAdmin: CurrentUserDto = new CurrentUserDto();
userSuperAdmin.userId = uuid4();
userSuperAdmin.login = 'admin';
userSuperAdmin.email = 'admin@gmail.com';
userSuperAdmin.orgId = OrgIdEnums.IT_INCUBATOR;
userSuperAdmin.roles = [UserRolesEnums.SA];
userSuperAdmin.isBanned = false;
