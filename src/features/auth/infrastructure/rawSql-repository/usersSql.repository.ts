import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserRawSqlDto } from '../../dto/createUserRawSql.dto';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async createUser(
    createUserRawSql: CreateUserRawSqlDto,
  ): Promise<CreateUserRawSqlDto> {
    try {
      const insertNewUser = await this.db.query(
        `
        INSERT INTO public."Users"
        ( "login", 
          "email", 
          "passwordHash", 
          "createdAt", 
          "orgId", 
          "roles", 
          "isBanned", 
          "banDate", 
          "banReason", 
          "confirmationCode", 
          "expirationDate", 
          "isConfirmed", 
          "isConfirmedDate")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          returning id`,
        [
          createUserRawSql.login.toLowerCase(),
          createUserRawSql.email,
          createUserRawSql.passwordHash,
          createUserRawSql.createdAt,
          createUserRawSql.orgId,
          createUserRawSql.roles,
          createUserRawSql.isBanned,
          createUserRawSql.banDate,
          createUserRawSql.banReason,
          createUserRawSql.confirmationCode,
          createUserRawSql.expirationDate,
          createUserRawSql.isConfirmed,
          createUserRawSql.isConfirmedDate,
          createUserRawSql.ip,
          createUserRawSql.userAgent,
        ],
      );

      return createUserRawSql;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}
