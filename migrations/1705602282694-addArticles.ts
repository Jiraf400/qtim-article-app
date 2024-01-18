import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArticles1705602282694 implements MigrationInterface {
  name = 'AddArticles1705602282694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "articles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "publishedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_pkey"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "FK_a9d18538b896fe2a6762e143bea" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_a9d18538b896fe2a6762e143bea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "id" bigint NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`DROP TABLE "articles"`);
  }
}
