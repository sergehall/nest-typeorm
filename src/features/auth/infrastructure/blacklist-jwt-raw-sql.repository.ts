import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InvalidJwtDto } from '../dto/invalid-jwt.dto';
import { InternalServerErrorException } from '@nestjs/common';

export class BlacklistJwtRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async addJwt(jwtBlacklistDto: InvalidJwtDto): Promise<boolean> {
    try {
      const result = await this.db.query(
        `
      INSERT INTO public."BlacklistJwt"("jwt", "expirationDate")
      VALUES ($1, $2)
      RETURNING "id"
      `,
        [jwtBlacklistDto.refreshToken, jwtBlacklistDto.expirationDate],
      );
      return result[0] !== null;
    } catch (err) {
      return false;
    }
  }

  async clearingInvalidJWTFromBlackList(): Promise<void> {
    try {
      const currentTime = new Date().toISOString();
      return await this.db.query(
        `
      DELETE FROM public."BlacklistJwt"
      WHERE "expirationDate" < $1
      returning "expirationDate"
      `,
        [currentTime],
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
  async JwtExistInBlackList(jwt: string): Promise<boolean> {
    try {
      const findJwt = await this.db.query(
        `
        SELECT "jwt", "expirationDate"
        FROM public."BlacklistJwt"
        WHERE "jwt" = $1
      `,
        [jwt],
      );
      return findJwt.length !== 0;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
