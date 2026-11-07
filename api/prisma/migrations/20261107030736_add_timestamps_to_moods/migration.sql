/*
  Warnings:

  - Added the required column `updated_at` to the `moods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "moods"
ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- Backfill from moment: it is the only proxy for when the row was written.
-- Using now() here would mark every existing mood as freshly editable.
UPDATE "moods" SET created_at = moment, updated_at = moment;

ALTER TABLE "moods" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "moods" ALTER COLUMN "updated_at" SET NOT NULL;
