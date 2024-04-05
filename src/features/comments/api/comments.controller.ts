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
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { LikeStatusDto } from '../dto/like-status.dto';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { ChangeLikeStatusCommentCommand } from '../application/use-cases/change-likeStatus-comment.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import { IdParams } from '../../../common/query/params/id.params';
import { CommentIdParams } from '../../../common/query/params/commentId.params';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { CommentViewModel } from '../views/comment.view-model';
import { LikeStatusCommentsEntity } from '../entities/like-status-comments.entity';
import { GetCommentByIdCommand } from '../application/use-cases/get-comment-by-id';
import { ApiTags } from '@nestjs/swagger';

@SkipThrottle()
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(protected commandBus: CommandBus) {}

  @Get(':id')
  @UseGuards(NoneStatusGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async findCommentById(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<CommentViewModel> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new GetCommentByIdCommand(params.id, currentUserDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Request() req: any,
    @Param() params: CommentIdParams,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new UpdateCommentCommand(
        params.commentId,
        updateCommentDto,
        currentUserDto,
      ),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async deleteComment(
    @Request() req: any,
    @Param() params: CommentIdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new DeleteCommentCommand(params.commentId, currentUserDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  async changeLikeStatusComment(
    @Request() req: any,
    @Param() params: CommentIdParams,
    @Body() likeStatusDto: LikeStatusDto,
  ): Promise<LikeStatusCommentsEntity> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new ChangeLikeStatusCommentCommand(
        params.commentId,
        likeStatusDto,
        currentUserDto,
      ),
    );
  }
}
