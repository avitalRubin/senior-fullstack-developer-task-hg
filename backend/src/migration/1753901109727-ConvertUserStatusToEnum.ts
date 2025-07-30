import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertUserStatusToEnum1753901109727
  implements MigrationInterface
{
  name = 'ConvertUserStatusToEnum1753901109727';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create temporary table with 'status' as Text
    await queryRunner.query(`
      CREATE TABLE "users_temp" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "username" TEXT NOT NULL UNIQUE,
        "roles" TEXT NOT NULL DEFAULT '["User"]',
        "status" TEXT NULL
      );
    `);

    // 2. Copy and transform data into new table
    await queryRunner.query(`
      INSERT INTO users_temp (id, username, roles, status)
      SELECT
        id,
        username,
        roles,
        CASE
          WHEN status = 1 THEN 'Enabled'
          WHEN status = 0 THEN 'Disabled'
          WHEN status = 2 THEN 'Deleted'
          ELSE NULL
        END
      FROM users
    `);

    // 3. Replace original table
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`ALTER TABLE users_temp RENAME TO users`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Recreate original users table
    await queryRunner.query(`
      CREATE TABLE "users_temp" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "username" TEXT NOT NULL UNIQUE,
        "roles" TEXT NOT NULL DEFAULT '["User"]',
        "status" INTEGER NULL
      );
    `);

    await queryRunner.query(`
      INSERT INTO users_temp (id, username, roles, status)
      SELECT
        id,
        username,
        roles,
        CASE
          WHEN status = 'Enabled' THEN 1
          WHEN status = 'Disabled' THEN 0
          WHEN status = 'Deleted' THEN 2
          ELSE NULL
        END
      FROM users
    `);

    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`ALTER TABLE users_temp RENAME TO users`);
  }
}
