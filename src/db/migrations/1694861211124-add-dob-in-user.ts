import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDobInUser1694861211124 implements MigrationInterface {
  name = 'AddDobInUser1694861211124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Users" ADD "dob" date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "dob"`);
  }
}
