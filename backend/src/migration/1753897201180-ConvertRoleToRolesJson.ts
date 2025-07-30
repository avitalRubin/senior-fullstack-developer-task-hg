import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertRoleToRolesJson1753897201180 implements MigrationInterface {
  name = 'ConvertRoleToRolesJson1753897201180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create temporary table with 'roles' instead of 'role'
    await queryRunner.query(`
      CREATE TABLE "users_temp" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "username" TEXT NOT NULL UNIQUE,
        "roles" TEXT NOT NULL DEFAULT '["User"]',
        "status" INTEGER NULL
      );
    `);

    // 2. Migrate and transform data
    const users = (await queryRunner.query(`
      SELECT id, username, role, status FROM users
    `)) as Array<{
      id: number;
      username: string;
      role: string;
      status: number | null;
    }>;

    for (const user of users) {
      const rolesJson = JSON.stringify([user.role]); // e.g., 'Admin' → '["Admin"]'
      await queryRunner.query(
        `INSERT INTO users_temp (id, username, roles, status) VALUES (?, ?, ?, ?)`,
        [user.id, user.username, rolesJson, user.status],
      );
    }

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
        "role" TEXT NOT NULL DEFAULT 'User',
        "status" INTEGER NULL
      );
    `);

    // 2. Convert JSON array back to string role
    const users = (await queryRunner.query(`
      SELECT id, username, roles, status FROM users
    `)) as Array<{
      id: number;
      username: string;
      roles: string;
      status: number | null;
    }>;

    for (const user of users) {
      let role = 'User';
      try {
        const rolesArray = JSON.parse(user.roles) as unknown;
        if (
          Array.isArray(rolesArray) &&
          rolesArray.length > 0 &&
          typeof rolesArray[0] === 'string'
        ) {
          role = rolesArray[0];
        }
      } catch (e) {
        console.warn('Failed to parse roles:', e);
      }

      await queryRunner.query(
        `INSERT INTO users_temp (id, username, role, status) VALUES (?, ?, ?, ?)`,
        [user.id, user.username, role, user.status],
      );
    }

    // 3. Replace current table with original
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`ALTER TABLE users_temp RENAME TO users`);
  }
}
