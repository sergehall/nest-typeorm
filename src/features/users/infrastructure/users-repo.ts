import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, Repository, UpdateResult } from 'typeorm';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import { UsersEntity } from '../entities/users.entity';
import * as uuid4 from 'uuid4';
import { DataForCreateUserDto } from '../dto/data-for-create-user.dto';
import { OrgIdEnums } from '../enums/org-id.enums';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { BanInfoDto } from '../dto/banInfo.dto';

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
      const offset = (queryData.queryPagination.pageNumber - 1) * limit;

      const query = this.usersRepository
        .createQueryBuilder('user')
        .select([
          'user.userId',
          'user.login',
          'user.email',
          'user.passwordHash',
          'user.createdAt',
          'user.orgId',
          'user.roles',
          'user.isBanned',
          'user.banDate',
          'user.banReason',
          'user.confirmationCode',
          'user.expirationDate',
          'user.isConfirmed',
          'user.isConfirmedDate',
        ])
        .where('(user.email LIKE :email OR user.login LIKE :login)', {
          email: searchEmailTerm,
          login: searchLoginTerm,
        })
        .andWhere('user.isBanned IN (:...banStatus)', {
          banStatus: banCondition,
        })
        .orderBy(`user.${sortBy}`, direction)
        .limit(limit)
        .offset(offset);

      return await query.getMany();
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
        .where('(user.email LIKE :email OR user.login LIKE :login)', {
          email: searchEmailTerm,
          login: searchLoginTerm,
        })
        .andWhere('user.isBanned IN (:...banStatus)', {
          banStatus: banCondition,
        })
        .getRawOne();

      return Number(totalCount.count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserById(userId: string): Promise<UsersEntity | null> {
    try {
      const user = await this.usersRepository.findBy({ userId });

      return user[0] ? user[0] : null;
    } catch (error) {
      if (await this.isInvalidUUIDError(error)) {
        const userId = await this.extractUserIdFromError(error);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
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

  async loginOrEmailAlreadyExist(key: string): Promise<string | null> {
    try {
      const keyLowerCase = key.toLowerCase();
      const result = await this.usersRepository
        .createQueryBuilder('user')
        .select(['user.login AS login', 'user.email AS email'])
        .where('LOWER(user.login) = :key OR LOWER(user.email) = :key', {
          key: keyLowerCase,
        })
        .getRawOne();

      if (result) {
        // Determine which field was found and return it
        return result.login ? result.login : result.email;
      } else {
        return null;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async saBanUnbanUser(userId: string, banInfo: BanInfoDto): Promise<boolean> {
    const { isBanned, banReason, banDate } = banInfo;
    try {
      await this.usersRepository.manager.transaction(
        async (transactionalEntityManager: EntityManager) => {
          await transactionalEntityManager.update(
            'LikeStatusComments',
            { ratedCommentUser: userId },
            { isBanned },
          );

          await transactionalEntityManager.update(
            'LikeStatusPosts',
            { ratedPostUser: userId },
            { isBanned },
          );
          await transactionalEntityManager
            .createQueryBuilder()
            .update('Comments')
            .set({ dependencyIsBanned: isBanned })
            .where('commentatorInfoUserId = :userId', { userId })
            .execute();
          await transactionalEntityManager
            .createQueryBuilder()
            .update('Posts')
            .set({ dependencyIsBanned: isBanned })
            .where('postOwner = :userId', { userId })
            .execute();
          await transactionalEntityManager
            .createQueryBuilder()
            .update('BloggerBlogs')
            .set({ dependencyIsBanned: isBanned })
            .where('blogOwnerId = :userId', { userId })
            .execute();
          await transactionalEntityManager.delete('SecurityDevices', {
            user: userId,
          });
          await transactionalEntityManager.update(
            'Users',
            { userId },
            { isBanned, banDate, banReason },
          );
        },
      );

      if (isBanned) {
        console.log(`User Ban 🚫. The user with ID ${userId} has been successfully banned.
          This action was taken due to "${banReason}".
          Thank you for maintaining a safe environment for our community.`);
      } else {
        console.log(`User Unban 🔓. The user with ID ${userId} has been successfully unbanned. 
        They can now access the platform and perform actions as usual. 
        We appreciate your attention to ensuring a fair and inclusive community environment.`);
      }

      return true;
    } catch (error) {
      console.error(`User Ban Error ❌❗ ${error.message}
      We encountered an issue while attempting to ban the user with ID ${userId}.
      Unfortunately, we couldn't complete the ban operation at this time. 
      Please try again later or contact our support team for assistance.
      We apologize for any inconvenience this may have caused.`);

      throw new InternalServerErrorException(error.message);
    }
  }

  async createUser(
    dataForCreateUserDto: DataForCreateUserDto,
  ): Promise<UsersEntity> {
    try {
      const newUserEntity: UsersEntity = await this.createUserEntity(
        dataForCreateUserDto,
      );
      return await this.usersRepository.save(newUserEntity);
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        const extractedFieldName = await this.extractValueFromMessage(
          error.detail,
        );
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

  async createSaUser(
    dataForCreateUserDto: DataForCreateUserDto,
  ): Promise<UsersEntity> {
    const { login, email } = dataForCreateUserDto;

    // Check if a user with the same login or email already exists
    const existingUser = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.login = :login OR user.email = :email', { login, email })
      .getOne();

    if (existingUser) {
      // User with the same login or email already exists, do nothing
      return existingUser;
    }

    // If no existing user found, create a new user
    const newSaUserEntity: UsersEntity = await this.createSaUserEntity(
      dataForCreateUserDto,
    );

    return await this.usersRepository.save(newSaUserEntity);
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
      return await this.usersRepository.findOneBy({ userId });
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
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
      console.error(`Error while removing data for users: ${error.message}`);
      throw new Error(`Error while removing data for users`);
    }
  }

  async clearingExpiredUsersData(): Promise<void> {
    try {
      await this.usersRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const isConfirmed = false;
          const currentTime = new Date().toISOString();

          const allUsersWithExpiredDate = await this.usersRepository.find({
            select: ['userId'],
            where: {
              isConfirmed,
              expirationDate: LessThan(currentTime),
            },
          });
          await Promise.all(
            allUsersWithExpiredDate.map((user) =>
              this.deleteUserData(user.userId, transactionalEntityManager),
            ),
          );
        },
      );
    } catch (error) {
      console.error(`Error while removing data for users: ${error.message}`);
      throw new InternalServerErrorException(
        `Error while removing data for users`,
      );
    }
  }

  private async deleteUserData(
    userId: string,
    entityManager: EntityManager,
  ): Promise<void> {
    try {
      await Promise.all([
        entityManager.delete('SecurityDevices', { user: userId }),
        entityManager.delete('BannedUsersForBlogs', {
          bannedUserForBlogs: userId,
        }),
        entityManager.delete('SentCodesLog', { sentForUser: userId }),
        entityManager.delete('LikeStatusComments', {
          ratedCommentUser: userId,
        }),
        entityManager.delete('LikeStatusPosts', { ratedPostUser: userId }),
      ]);
      await entityManager
        .createQueryBuilder()
        .delete()
        .from('Comments')
        .where('commentatorInfoUserId = :userId', { userId })
        .execute();
      await entityManager.delete('Posts', { postOwner: userId });
      await entityManager
        .createQueryBuilder()
        .delete()
        .from('BloggerBlogs')
        .where('blogOwnerId = :userId', { userId })
        .execute();

      await entityManager.delete('Users', { userId });
    } catch (error) {
      console.error(
        `Error while removing data for user ${userId}: ${error.message}`,
      );
      throw new Error(`Error while removing data for user ${userId}`);
    }
  }

  private async extractValueFromMessage(message: string) {
    const match = /\(([^)]+)\)/.exec(message);
    return match ? match[1] : 'null';
  }

  private async createUserEntity(
    dto: DataForCreateUserDto,
  ): Promise<UsersEntity> {
    const { login, email, passwordHash, expirationDate } = dto;

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

    return user;
  }

  private async createSaUserEntity(
    dto: DataForCreateUserDto,
  ): Promise<UsersEntity> {
    const user = await this.createUserEntity(dto);
    user.roles = [UserRolesEnums.USER, UserRolesEnums.SA];
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
      ],
      'createdAt',
    );
  }

  private async isInvalidUUIDError(error: any): Promise<boolean> {
    return error.message.includes('invalid input syntax for type uuid');
  }

  private async extractUserIdFromError(error: any): Promise<string | null> {
    const match = error.message.match(/"([^"]+)"/);
    return match ? match[1] : null;
  }
}
