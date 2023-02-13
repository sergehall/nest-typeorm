import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BBlogsBannedUserDocument = HydratedDocument<BannedUsers>;

@Schema()
export class BanInfo {
  @Prop({ required: true })
  isBanned: boolean;
  @Prop({ required: true })
  banDate: string;
  @Prop({ required: true })
  banReason: string;
}

@Schema()
export class BannedUsers {
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  banInfo: BanInfo;
}

export const BBlogsBannedUsersSchema =
  SchemaFactory.createForClass(BannedUsers);
