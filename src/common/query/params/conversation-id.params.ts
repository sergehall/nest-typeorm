import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ConversationIdParams {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100, {
    message: 'Incorrect conversationId length! Must be max 100 ch.',
  })
  conversationId: string;
}
