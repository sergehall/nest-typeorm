import { Role } from '../../ability/roles/role.enum';
import { Prop } from '@nestjs/mongoose';

export class BanInfo {
  @Prop({ required: true })
  isBanned: boolean;
  @Prop({ type: String, default: null })
  banDate: string | null;
  @Prop({ type: String, default: null })
  banReason: string | null;
}
export class EmailConfirmation {
  @Prop({ required: true })
  confirmationCode: string;
  @Prop({ required: true })
  expirationDate: string;
  @Prop({ required: true })
  isConfirmed: boolean;
  @Prop({ type: String, default: null })
  isConfirmedDate: string | null;
  @Prop({ required: true })
  sentEmail: string[];
}
export class RegistrationData {
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  userAgent: string;
}
export class UsersEntity {
  @Prop({ required: true, unique: true })
  id: string;
  @Prop({ required: true, unique: true })
  login: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  passwordHash: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  orgId: string;
  @Prop({ required: true })
  roles: Role;
  @Prop({ required: true, type: BanInfo })
  banInfo: BanInfo;
  @Prop({ required: true, type: EmailConfirmation })
  emailConfirmation: EmailConfirmation;
  @Prop({ required: true, type: RegistrationData })
  registrationData: RegistrationData;
}
