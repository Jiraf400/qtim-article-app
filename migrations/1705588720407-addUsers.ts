import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsers1705588720407 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE users (\n' +
        '    id BIGINT PRIMARY KEY,\n' +
        '    email VARCHAR UNIQUE,\n' +
        '    name VARCHAR,\n' +
        '    password VARCHAR\n' +
        ');',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE users');
  }
}
