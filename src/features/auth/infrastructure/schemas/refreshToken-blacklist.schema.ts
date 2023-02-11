import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type refreshTokenBlackListDocument =
  HydratedDocument<refreshTokenBlackList>;

@Schema()
export class refreshTokenBlackList {
  @Prop({ required: true })
  refreshToken: string;
  @Prop({ required: true })
  expirationDate: string;
}

export const RefreshTokenBlacklistSchema = SchemaFactory.createForClass(
  refreshTokenBlackList,
);
