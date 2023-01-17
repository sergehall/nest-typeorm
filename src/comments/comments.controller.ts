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
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LikeStatusDto } from './dto/like-status.dto';
import { User } from '../users/infrastructure/schemas/user.schema';
import { AbilitiesGuard } from '../ability/abilities.guard';
import { CheckAbilities } from '../ability/abilities.decorator';
import { Action } from '../ability/roles/action.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NoneStatusGuard } from '../auth/guards/none-status.guard';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @UseGuards(NoneStatusGuard)
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
    return this.commentsService.updateComment(
      commentId,
      updateCommentDto,
      req.user,
    );
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async removeComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
  ) {
    console.log(req.user);
    return this.commentsService.removeComment(commentId, req.user);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  async changeLikeStatusComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    return this.commentsService.changeLikeStatusComment(
      commentId,
      likeStatusDto,
      req.user,
    );
  }
}
