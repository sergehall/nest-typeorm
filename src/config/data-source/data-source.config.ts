// import { PostgresConfig } from '../db/postgres/postgres.config';
// import { Injectable } from '@nestjs/common';
// import { DataSource } from 'typeorm';
// import { UsersEntity } from '../../features/users/entities/users.entity';
// import { SecurityDevicesEntity } from '../../features/security-devices/entities/session-devices.entity';
// import { BloggerBlogsEntity } from '../../features/blogger-blogs/entities/blogger-blogs.entity';
// import { PostsEntity } from '../../features/posts/entities/posts.entity';
// import { CommentsEntity } from '../../features/comments/entities/comments.entity';
// import { BannedUsersForBlogsEntity } from '../../features/users/entities/banned-users-for-blogs.entity';
// import { LikeStatusPostsEntity } from '../../features/posts/entities/like-status-posts.entity';
// import { LikeStatusCommentsEntity } from '../../features/comments/entities/like-status-comments.entity';
// import { InvalidJwtEntity } from '../../features/auth/entities/invalid-jwt.entity';
// import { SentCodesLogEntity } from '../../mails/infrastructure/entities/sent-codes-log.entity';
// import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
//
// @Injectable()
// export class MigrationsOrmOptions implements TypeOrmOptionsFactory {
//   async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
//     return {
//       type: 'postgres',
//       host: process.env.PG_HOST_HEROKU,
//       port: Number(process.env.PG_PORT) | 5432,
//       username: process.env.PG_HEROKU_USER_NAME,
//       password: process.env.PG_HEROKU_USER_PASSWORD,
//       database: process.env.PG_HEROKU_NAME_DATABASE,
//       synchronize: false,
//       entities: [
//         UsersEntity,
//         SecurityDevicesEntity,
//         BloggerBlogsEntity,
//         PostsEntity,
//         CommentsEntity,
//         BannedUsersForBlogsEntity,
//         LikeStatusPostsEntity,
//         LikeStatusCommentsEntity,
//         InvalidJwtEntity,
//         SentCodesLogEntity,
//       ],
//       migrations: ['src/db/migrations/*.ts'], // Specify the path to your migrations
//     };
//   }
// }
// // @Injectable()
// // export class MigrationsOrmOptions
// //   extends PostgresConfig
// //   implements TypeOrmOptionsFactory
// // {
// //   async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
// //     const host = await this.getHost('PG_HOST_HEROKU');
// //     const port = await this.getPort('PG_PORT');
// //     const username = await this.getAuth('PG_HEROKU_USER_NAME');
// //     const password = await this.getAuth('PG_HEROKU_USER_PASSWORD');
// //     const database = await this.getNamesDatabase('PG_HEROKU_NAME_DATABASE');
// //
// //     return {
// //       type: 'postgres',
// //       host,
// //       port,
// //       username,
// //       password,
// //       database,
// //       synchronize: false,
// //       entities: [
// //         UsersEntity,
// //         SecurityDevicesEntity,
// //         BloggerBlogsEntity,
// //         PostsEntity,
// //         CommentsEntity,
// //         BannedUsersForBlogsEntity,
// //         LikeStatusPostsEntity,
// //         LikeStatusCommentsEntity,
// //         InvalidJwtEntity,
// //         SentCodesLogEntity,
// //       ],
// //       migrations: ['dist/migrations/*.js'], // Specify the path to your migrations
// //     };
// //   }
// // }
