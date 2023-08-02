import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { OrgIdEnums } from '../../users/enums/org-id.enums';
import { RolesEnums } from '../../../ability/enums/roles.enums';

export const userSuperAdmin: CurrentUserDto = new CurrentUserDto();
userSuperAdmin.id = 'sa-id';
userSuperAdmin.login = 'sa-login';
userSuperAdmin.email = 'sa@email.com';
userSuperAdmin.orgId = OrgIdEnums.IT_INCUBATOR;
userSuperAdmin.roles = RolesEnums.SA;
userSuperAdmin.isBanned = false;
userSuperAdmin.payloadExp = 'sa-infinity';
