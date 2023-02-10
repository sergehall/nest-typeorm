import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  UseGuards,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { LikeStatusDto } from '../dto/like-status.dto';
import { User } from '../../users/infrastructure/schemas/user.schema';
import { AbilitiesGuard } from '../../ability/abilities.guard';
import { CheckAbilities } from '../../ability/abilities.decorator';
import { Action } from '../../ability/roles/action.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { ChangeLikeStatusCommentCommand } from './use-cases/change-likeStatus-comment.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './use-cases/update-comment.use-case';
import { RemoveCommentCommand } from './use-cases/remove-comment.use-case';

@SkipThrottle()
@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    protected commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(NoneStatusGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: User })
  async findComment(@Request() req: any, @Param('id') id: string) {
    return this.commentsService.findCommentById(id, req.user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commandBus.execute(
      new UpdateCommentCommand(commentId, updateCommentDto, req.user),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async removeComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
  ) {
    return await this.commandBus.execute(
      new RemoveCommentCommand(commentId, req.user),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  async changeLikeStatusComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    return await this.commandBus.execute(
      new ChangeLikeStatusCommentCommand(commentId, likeStatusDto, req.user),
    );
  }
}
