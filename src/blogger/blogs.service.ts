import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as uuid4 from 'uuid4';
import { BlogsEntity } from './entities/blogs.entity';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { PostsService } from '../posts/posts.service';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { CurrentUserDto } from '../auth/dto/currentUser.dto';
import { CaslAbilityFactory } from '../ability/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../ability/roles/action.enum';
import { CreatePostAndNameDto } from '../posts/dto/create-post-and-name.dto';
import { PaginationDto } from '../infrastructure/common/pagination/dto/pagination.dto';
import { QueryArrType } from '../infrastructure/common/convert-filters/types/convert-filter.types';
import { PaginationTypes } from '../infrastructure/common/pagination/types/pagination.types';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { UpdateBBlogsDto } from './dto/update-bblogs.dto';
import { BlogsOwnerDto } from './dto/blogs-owner.dto';
import { UpdatePostBBlogDto } from './dto/update-post-bblog.dto';

@Injectable()
export class BlogsService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    private bBlogsRepository: BlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    private postsService: PostsService,
  ) {}
  async findBlogs(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    let field = 'createdAt';
    if (
      queryPagination.sortBy === 'name' ||
      queryPagination.sortBy === 'websiteUrl' ||
      queryPagination.sortBy === 'description'
    ) {
      field = queryPagination.sortBy;
    }
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const pagination = await this.pagination.convert(queryPagination, field);
    const totalCount = await this.bBlogsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    const blogs: BlogsEntity[] = await this.bBlogsRepository.findBlogs(
      pagination,
      convertedFilters,
    );
    const pageNumber = queryPagination.pageNumber;
    const pageSize = pagination.pageSize;
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }
  async findBlogsByUserId(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    let field = 'createdAt';
    if (
      queryPagination.sortBy === 'name' ||
      queryPagination.sortBy === 'websiteUrl' ||
      queryPagination.sortBy === 'description'
    ) {
      field = queryPagination.sortBy;
    }
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const pagination = await this.pagination.convert(queryPagination, field);
    const totalCount = await this.bBlogsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    const blogs: BlogsEntity[] = await this.bBlogsRepository.findBlogsByUserId(
      pagination,
      convertedFilters,
    );
    const pageNumber = queryPagination.pageNumber;
    const pageSize = pagination.pageSize;
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }

  async createBlog(bBlogsOwnerDto: BlogsOwnerDto) {
    const blogsEntity = {
      ...bBlogsOwnerDto,
      id: uuid4().toString(),
      createdAt: new Date().toISOString(),
    };
    const newBlog: BlogsEntity = await this.bBlogsRepository.createBBlogs(
      blogsEntity,
    );
    return {
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
    };
  }
  async findBlogById(id: string): Promise<BlogsEntity | null> {
    return this.bBlogsRepository.findBlogById(id);
  }
  async createPost(createPostDto: CreatePostDto, currentUser: CurrentUserDto) {
    const blog: BlogsEntity | null = await this.bBlogsRepository.findBlogById(
      createPostDto.blogId,
    );
    if (!blog) throw new NotFoundException();

    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blog.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.CREATE, {
        id: currentUser.id,
      });
      const createPost: CreatePostAndNameDto = {
        title: createPostDto.title,
        shortDescription: createPostDto.shortDescription,
        content: createPostDto.content,
        blogId: blog.id,
        name: blog.name,
      };
      return await this.postsService.createPost(createPost);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
  async updateBlogById(
    id: string,
    updateBlogDto: UpdateBBlogsDto,
    currentUser: CurrentUserDto,
  ) {
    const blogToUpdate: BlogsEntity | null =
      await this.bBlogsRepository.findBlogById(id);
    if (!blogToUpdate) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blogToUpdate.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUser.id,
      });
      const blogEntity: BlogsEntity = {
        id: blogToUpdate.id,
        name: updateBlogDto.name,
        description: updateBlogDto.description,
        websiteUrl: updateBlogDto.websiteUrl,
        createdAt: blogToUpdate.createdAt,
        blogOwnerInfo: {
          userId: blogToUpdate.blogOwnerInfo.userId,
          userLogin: blogToUpdate.blogOwnerInfo.userLogin,
        },
      };
      return await this.bBlogsRepository.updatedBlogById(blogEntity);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
  async removeBlogById(id: string, currentUser: CurrentUserDto) {
    const blogToDelete = await this.bBlogsRepository.findBlogById(id);
    if (!blogToDelete) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blogToDelete.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: currentUser.id,
      });
      return await this.bBlogsRepository.removeBlogById(id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
  async updatePostByPostId(
    blogId: string,
    postId: string,
    updatePostBBlogDto: UpdatePostBBlogDto,
    currentUser: CurrentUserDto,
  ) {
    const blog: BlogsEntity | null = await this.bBlogsRepository.findBlogById(
      blogId,
    );
    if (!blog) throw new NotFoundException();

    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blog.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: currentUser.id,
      });
      const updatePostDto = { ...updatePostBBlogDto, blogId: blogId };
      return await this.postsService.updatePost(postId, updatePostDto);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
  async removePostByPostId(
    blogId: string,
    postId: string,
    currentUser: CurrentUserDto,
  ): Promise<boolean | undefined> {
    const blogToDelete = await this.bBlogsRepository.findBlogById(blogId);
    if (!blogToDelete) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blogToDelete.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: currentUser.id,
      });

      return await this.postsService.removePost(postId);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
}
