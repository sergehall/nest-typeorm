import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { OrgIdEnums } from '../../users/enums/org-id.enums';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';

export const userSuperAdmin: CurrentUserDto = new CurrentUserDto();
userSuperAdmin.id = 'sa-id';
userSuperAdmin.login = 'sa-login';
userSuperAdmin.email = 'sa@email.com';
userSuperAdmin.orgId = OrgIdEnums.IT_INCUBATOR;
userSuperAdmin.roles = UserRolesEnums.SA;
userSuperAdmin.isBanned = false;
userSuperAdmin.payloadExp = 'sa-infinity';
