/*
  Warnings:

  - Added the required column `updated_at` to the `triggers` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "triggers"
ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3);

UPDATE "triggers" SET created_at = moment, updated_at = moment;

ALTER TABLE "triggers" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "triggers" ALTER COLUMN "updated_at" SET NOT NULL;
