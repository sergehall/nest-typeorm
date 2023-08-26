import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import { UsersEntity } from '../entities/users.entity';
import * as uuid4 from 'uuid4';
import { DataForCreateUserDto } from '../dto/data-for-create-user.dto';
import { OrgIdEnums } from '../enums/org-id.enums';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { SecurityDevicesEntity } from '../../security-devices/entities/session-devices.entity';
import { BannedUserForBlogEntity } from '../entities/banned-user-for-blog.entity';
import { SentCodesLogEntity } from '../../../mails/infrastructure/entities/sent-codes-log.entity';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';
import { LikeStatusPostsEntity } from '../../posts/entities/like-status-posts.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';

export class UsersRepo {
  constructor(
    private readonly keyResolver: KeyResolver,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}
  async findUsers(queryData: ParseQueriesDto): Promise<UsersEntity[]> {
    try {
      const searchEmailTerm = queryData.searchEmailTerm;
      const searchLoginTerm = queryData.searchLoginTerm;
      const banCondition = queryData.banStatus;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset =
        (queryData.queryPagination.pageNumber - 1) *
        queryData.queryPagination.pageSize;

      return await this.usersRepository
        .createQueryBuilder('user')
        .select('*')
        .where('user.email LIKE :email OR user.login LIKE :login', {
          email: searchEmailTerm,
          login: searchLoginTerm,
        })
        .andWhere('user.isBanned IN (:...banCondition)', { banCondition })
        .orderBy(`user.${sortBy}`, direction)
        .limit(limit)
        .offset(offset)
        .getRawMany();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountUsers(queryData: ParseQueriesDto): Promise<number> {
    try {
      const searchEmailTerm = queryData.searchEmailTerm;
      const searchLoginTerm = queryData.searchLoginTerm;
      const banCondition = queryData.banStatus;

      const totalCount = await this.usersRepository
        .createQueryBuilder('user')
        .select('COUNT(user.userId)', 'count')
        .where('user.email LIKE :email OR user.login LIKE :login', {
          email: searchEmailTerm,
          login: searchLoginTerm,
        })
        .andWhere('user.isBanned IN (:...banCondition)', { banCondition })
        .getRawOne();

      return Number(totalCount.count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserById(userId: string): Promise<UsersEntity | null> {
    const user = await this.usersRepository.findBy({ userId: userId });
    return user[0] ? user[0] : null;
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersEntity | null> {
    try {
      const user = await this.usersRepository.findOne({
        where: [{ email: loginOrEmail }, { login: loginOrEmail }],
      });

      return user ? user : null;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createUser(
    dataForCreateUserDto: DataForCreateUserDto,
  ): Promise<UsersEntity> {
    try {
      const newUserEntity = await this.createUserEntity(dataForCreateUserDto);
      return await this.usersRepository.save(newUserEntity);
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        const extractedFieldName = this.extractValueFromMessage(error.detail);
        const constraint = error.message.match(/"(.*?)"/)[1];

        const field = extractedFieldName || constraint;

        throw new HttpException(
          {
            message: {
              message: error.message,
              field: field,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateCodeAndExpirationByEmail(
    email: string,
    confirmationCode: string,
    expirationDate: string,
  ): Promise<UsersEntity | null> {
    try {
      const userToUpdate = await this.usersRepository.findOneBy({ email });

      if (!userToUpdate) {
        return null;
      }

      userToUpdate.confirmationCode = confirmationCode;
      userToUpdate.expirationDate = expirationDate;

      return await this.usersRepository.save(userToUpdate);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUserRole(userId: string): Promise<UsersEntity | null> {
    const newRoles = [UserRolesEnums.SA];

    try {
      // Update the user roles
      const updateResult: UpdateResult = await this.usersRepository.update(
        userId,
        { roles: newRoles },
      );

      if (updateResult.affected === 0) {
        // If no rows were affected, user not found
        return null;
      }

      // Fetch and return the updated user
      return await this.usersRepository.findOneBy({ userId: userId });
    } catch (error) {
      // Handle errors (e.g., database errors)
      throw new Error(`Error updating user role: ${error.message}`);
    }
  }

  async deleteUserDataByUserId(userId: string): Promise<void> {
    try {
      await this.usersRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await this.deleteUserData(userId, transactionalEntityManager);
        },
      );
    } catch (error) {
      this.handleUserDataRemovalError(error);
    }
  }

  private async deleteUserData(
    userId: string,
    client: EntityManager,
  ): Promise<void> {
    try {
      const deleteUserDataArray = await this.getDeleteDataArray(userId, client);

      await Promise.all(
        deleteUserDataArray.map(async (userData) => {
          for (const [entityName, entityIds] of Object.entries(userData)) {
            await this.deleteEntityData(entityName, entityIds, client);
          }
        }),
      );
      await this.deleteEntityData('Users', [{ userId }], client);
    } catch (error) {
      this.handleUserDataRemovalError(error, userId);
    }
  }

  private async getDeleteDataArray(
    userId: string,
    client: EntityManager,
  ): Promise<Array<{ [key: string]: string[] }>> {
    const entityMappings = [
      {
        Entity: SecurityDevicesEntity,
        Key: 'SecurityDevices',
        JoinColumn: 'user',
      },
      {
        Entity: BannedUserForBlogEntity,
        Key: 'BannedUserForBlog',
        JoinColumn: 'bannedUserForBlog',
      },
      {
        Entity: SentCodesLogEntity,
        Key: 'SentCodeLog',
        JoinColumn: 'sentForUser',
      },
      {
        Entity: LikeStatusCommentsEntity,
        Key: 'LikeStatusComments',
        JoinColumn: 'commentOwner',
      },
      {
        Entity: LikeStatusPostsEntity,
        Key: 'LikeStatusPosts',
        JoinColumn: 'postOwner',
      },
      { Entity: CommentsEntity, Key: 'Comments', JoinColumn: 'commentator' },
      { Entity: PostsEntity, Key: 'Posts', JoinColumn: 'postOwner' },
      {
        Entity: BloggerBlogsEntity,
        Key: 'BloggerBlogs',
        JoinColumn: 'blogOwner',
      },
    ];

    const deleteDataArray: Array<{ [key: string]: string[] }> = [];

    for (const mapping of entityMappings) {
      const entityIds = await this.getEntityIdsByUserId(
        userId,
        client,
        mapping,
      );
      if (entityIds.length > 0) {
        const keyValuePair = {
          [mapping.Key]: entityIds.map((entity) => entity.id),
        };
        deleteDataArray.push(keyValuePair);
      }
    }

    return deleteDataArray;
  }

  private async getEntityIdsByUserId(
    userId: string,
    client: EntityManager,
    mapping: any,
  ): Promise<any[]> {
    return await client
      .createQueryBuilder(mapping.Entity, 'entity')
      .select('entity.id')
      .innerJoin(`entity.${mapping.JoinColumn}`, 'associatedEntity')
      .where(`associatedEntity.userId = :userId`, { userId })
      .getMany();
  }

  private async deleteEntityData(
    entityName: string,
    entityIds: any[],
    client: EntityManager,
  ): Promise<void> {
    try {
      await client.delete(entityName, entityIds);
      console.log(
        `Data deleted for entity: ${entityName}, ids: ${JSON.stringify(
          entityIds,
        )}`,
      );
    } catch (error) {
      console.error(
        `Error while deleting data for entity: ${entityName}, ids: ${JSON.stringify(
          entityIds,
        )}`,
        error,
      );
    }
  }

  private handleUserDataRemovalError(error: any, userId?: string): void {
    const errorMessage = userId
      ? `Error while removing data for user ${userId}`
      : `Error while removing user data`;
    console.error(errorMessage, error);
    throw new InternalServerErrorException(errorMessage);
  }

  private extractValueFromMessage(message: string) {
    const match = /\(([^)]+)\)/.exec(message);
    return match ? match[1] : 'null';
  }

  private async createUserEntity(
    dto: DataForCreateUserDto,
  ): Promise<UsersEntity> {
    const { login, email, passwordHash, expirationDate, ip, userAgent } = dto;

    const user = new UsersEntity();
    user.userId = uuid4();
    user.login = login.toLowerCase();
    user.email = email.toLowerCase();
    user.passwordHash = passwordHash;
    user.createdAt = new Date().toISOString();
    user.orgId = OrgIdEnums.IT_INCUBATOR;
    user.roles = [UserRolesEnums.USER];
    user.isBanned = false;
    user.banDate = null;
    user.banReason = null;
    user.confirmationCode = uuid4();
    user.expirationDate = expirationDate;
    user.isConfirmed = false;
    user.ip = ip;
    user.userAgent = userAgent;

    return user;
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      [
        'userId',
        'login',
        'email',
        'orgId',
        'roles',
        'isBanned',
        'banDate',
        'banReason',
        'expirationDate',
        'isConfirmed',
        'isConfirmedDate',
        'ip',
        'userAgent',
      ],
      'createdAt',
    );
  }
}
