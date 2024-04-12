import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @MaxLength(800, {
    message: 'Incorrect content length! Must be max 800 ch.',
  })
  message: string;
  @IsNotEmpty({ message: 'Conversation ID is required.' })
  @IsString({ message: 'Invalid conversation ID format.' })
  conversationId: string;
}
