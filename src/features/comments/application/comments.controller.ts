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
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { ChangeLikeStatusCommentCommand } from './use-cases/change-likeStatus-comment.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './use-cases/update-comment.use-case';
import { RemoveCommentCommand } from './use-cases/remove-comment.use-case';
import { IdParams } from '../../common/params/id.params';
import { CommentIdParams } from '../../common/params/commentId.params';

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
  async findComment(@Request() req: any, @Param() params: IdParams) {
    return this.commentsService.findCommentById(params.id, req.user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Request() req: any,
    @Param() params: CommentIdParams,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commandBus.execute(
      new UpdateCommentCommand(params.commentId, updateCommentDto, req.user),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async removeComment(@Request() req: any, @Param() params: CommentIdParams) {
    return await this.commandBus.execute(
      new RemoveCommentCommand(params.commentId, req.user),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  async changeLikeStatusComment(
    @Request() req: any,
    @Param() params: CommentIdParams,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    return await this.commandBus.execute(
      new ChangeLikeStatusCommentCommand(
        params.commentId,
        likeStatusDto,
        req.user,
      ),
    );
  }
}
