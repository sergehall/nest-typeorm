import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtBlacklistDto } from '../../dto/jwt-blacklist.dto';

export class BlacklistJwtRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async addJWT(jwtBlacklistDto: JwtBlacklistDto): Promise<boolean> {
    try {
      const result = await this.db.query(
        `
      INSERT INTO public."BlacklistJwt"("refreshToken", "expirationDate")
      VALUES ($1, $2);
      returning id`,
        [jwtBlacklistDto.refreshToken, jwtBlacklistDto.expirationDate],
      );
      return result[0] !== null;
    } catch (err) {
      return false;
    }
  }
}
