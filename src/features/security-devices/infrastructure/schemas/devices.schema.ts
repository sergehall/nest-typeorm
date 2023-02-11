import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DevicesDocument = HydratedDocument<Devices>;

@Schema()
export class Devices {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  lastActiveDate: string;
  @Prop({ required: true })
  expirationDate: string;
  @Prop({ required: true })
  deviceId: string;
}

export const DevicesSchema = SchemaFactory.createForClass(Devices);
