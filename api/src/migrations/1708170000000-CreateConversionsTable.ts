import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConversionsTable1708170000000 implements MigrationInterface {
  name = 'CreateConversionsTable1708170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."conversions_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."conversions_sourcetype_enum" AS ENUM('PDF', 'DOCX')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."conversions_targettype_enum" AS ENUM('PDF', 'DOCX')
        `);
    await queryRunner.query(`
            CREATE TABLE "conversions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" "public"."conversions_status_enum" NOT NULL DEFAULT 'PENDING',
                "sourceType" "public"."conversions_sourcetype_enum" NOT NULL,
                "targetType" "public"."conversions_targettype_enum" NOT NULL,
                "fileName" character varying,
                "convertedFileUrl" character varying(500),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_conversions" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "conversions"`);
    await queryRunner.query(`DROP TYPE "public"."conversions_targettype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."conversions_sourcetype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."conversions_status_enum"`);
  }
}
