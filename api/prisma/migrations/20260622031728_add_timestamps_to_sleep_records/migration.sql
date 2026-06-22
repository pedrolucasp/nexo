/*
  Warnings:

  - Added the required column `updated_at` to the `sleep_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sleep_records"
ADD COLUMN     "created_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3);

UPDATE "sleep_records" SET created_at = date::timestamp, updated_at = date::timestamp;

ALTER TABLE "sleep_records" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "sleep_records" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "sleep_records" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "sleep_records" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
