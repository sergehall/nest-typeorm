import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from '../application/messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { MessagesEntity } from '../entities/messages.entity';
import { ConversationIdParams } from '../../../common/query/params/conversation-id.params';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Messages')
@Controller('conversation')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':conversationId/messages')
  async createMessage(
    @Request() req: any,
    @Param() params: ConversationIdParams,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessagesEntity> {
    const currentUserDto: CurrentUserDto = req.user;
    const conversationId: string = params.conversationId;

    return this.messagesService.createMessage(
      conversationId,
      createMessageDto,
      currentUserDto,
    );
  }

  @Get()
  async findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagesService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.messagesService.remove(+id);
  }
}
