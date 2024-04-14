// import {
//   ForbiddenException,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { ForbiddenError } from '@casl/ability';
// import { Action } from '../../../../ability/roles/action.enums';
// import { CaslAbilityFactory } from '../../../../ability/casl-ability.stripe';
// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
// import { BlogIdPostIdParams } from '../../../../common/query/params/blogId-postId.params';
// import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
// import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
// import { UpdatePostDto } from '../../dto/update-post.dto';
// import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
// import { TablesPostsEntity } from '../../entities/tables-posts-entity';
//
// export class UpdatePostByPostIdCommand {
//   constructor(
//     public params: BlogIdPostIdParams,
//     public updatePostDto: UpdatePostDto,
//     public currentUserDto: CurrentUserDto,
//   ) {}
// }
//
// @CommandHandler(UpdatePostByPostIdCommand)
// export class UpdatePostByPostIdUseCase
//   implements ICommandHandler<UpdatePostByPostIdCommand>
// {
//   constructor(
//     protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
//     protected postsRawSqlRepository: PostsRawSqlRepository,
//     protected caslAbilityFactory: CaslAbilityFactory,
//   ) {}
//
//   async execute(command: UpdatePostByPostIdCommand): Promise<boolean> {
//     const { params, updatePostDto, currentUserDto } = command;
//     const { blogId, postId } = params;
//     const blog: TableBloggerBlogsRawSqlEntity | null =
//       await this.bloggerBlogsRawSqlRepository.findBlogById(blogId);
//
//     if (!blog) {
//       throw new NotFoundException(`Blog with ID ${blogId} not found`);
//     }
//
//     const post: TablesPostsEntity | null =
//       await this.postsRawSqlRepository.getPostById(postId);
//
//     if (!post) {
//       throw new NotFoundException(`Blog with ID ${postId} not found`);
//     }
//
//     await this.checkUserPermission(blog.blogOwnerId, currentUserDto);
//
//     return await this.postsRawSqlRepository.updatePostByPostId(
//       params.postId,
//       updatePostDto,
//     );
//   }
//
//   private async checkUserPermission(
//     blogOwnerId: string,
//     currentUserDto: CurrentUserDto,
//   ) {
//     const ability = this.caslAbilityFactory.createForUserId({
//       id: blogOwnerId,
//     });
//     try {
//       ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
//         id: currentUserDto.userId,
//       });
//     } catch (error) {
//       if (error instanceof ForbiddenError) {
//         throw new ForbiddenException(
//           'You do not have permission to update a post. ' + error.message,
//         );
//       }
//       throw new InternalServerErrorException(error.message);
//     }
//   }
// }
