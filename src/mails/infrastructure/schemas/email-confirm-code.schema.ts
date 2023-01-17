import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmailsConfirmCodeDocument = HydratedDocument<EmailsConfirmCode>;
@Schema()
export class EmailsConfirmCode {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  confirmationCode: string;
  @Prop({ required: true })
  createdAt: string;
}

export const EmailsConfirmCodeSchema =
  SchemaFactory.createForClass(EmailsConfirmCode);
