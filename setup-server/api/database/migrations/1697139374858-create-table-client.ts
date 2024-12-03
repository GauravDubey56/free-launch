import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableClient1697139374858 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE SEQUENCE IF NOT EXISTS client_sequence;
        CREATE TABLE IF NOT EXISTS clients (
            id serial4 NOT NULL DEFAULT nextval('client_sequence') PRIMARY KEY,
            owner_id uuid DEFAULT uuid_generate_v4 (),
            client_info jsonb NULL,
            github_id varchar NULL,
            email varchar NOT NULL,
            first_name varchar NOT NULL,
            last_name varchar,
            "created_at" timestamptz NOT NULL DEFAULT now(),
            "updated_at" timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT "PK_5a764a1d6e2063aa892513473e3" PRIMARY KEY (id),
            CONSTRAINT "UQ_66a511a688df322c9a6a9f97bde" UNIQUE (email)
        );

        
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP table if exists clients;
    `)
  }
}
