-- AlterTable: migrate scheduled_at from text? to text[] preserving existing data
ALTER TABLE "medicine_regimens"
  ALTER COLUMN "scheduled_at" DROP DEFAULT,
  ALTER COLUMN "scheduled_at" TYPE text[]
    USING CASE
      WHEN "scheduled_at" IS NULL THEN ARRAY[]::text[]
      ELSE ARRAY["scheduled_at"]::text[]
    END,
  ALTER COLUMN "scheduled_at" SET DEFAULT '{}';
