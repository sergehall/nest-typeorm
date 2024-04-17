import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MessagesRepo } from '../infrastructure/messages.repo';
import { UsersEntity } from '../../users/entities/users.entity';
import { MessagesEntity } from '../entities/messages.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { ConversationsRepo } from '../infrastructure/conversations.repo';
import { SocketGateway } from '../../../socket/socket.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly messagesRepo: MessagesRepo,
    private readonly conversationsRepo: ConversationsRepo,
  ) {}

  async createMessage(
    conversationId: string,
    createMessageDto: CreateMessageDto,
    currentUserDto: CurrentUserDto,
  ): Promise<MessagesEntity> {
    // // const conversation = await this.conversationsRepo.findOne(conversationId)
    // if (!conversation)
    //   throw new NotFoundException(
    //     `Conversations with ID ${conversationId} not found`,
    //   );
    // const author = await this.usersRepo.findOne(createMessageDto.authorId);
    // if (!author)
    //   throw new NotFoundException(`Author with ID ${authorId} not found`);

    const title: string = 'New conversation';
    const description: string = 'New conversation description';

    const conversation = await this.conversationsRepo.createConversations(
      title,
      description,
    );

    const author = new UsersEntity();
    author.userId = currentUserDto.userId;
    author.login = currentUserDto.login;

    const message = createMessageDto.message;

    const createdMessage: MessagesEntity =
      await this.messagesRepo.createMessage(message, conversation, author);

    await this.socketGateway.sentToAll(createdMessage);

    return createdMessage;
  }

  async findAll() {
    return `This action returns all messages`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  async remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
