-- A logged dose keeps what was prescribed at the time it was taken, and
-- names the scheduled time it fulfils. Existing rows are backfilled from the
-- regimen they still point at; the slot stays NULL because nothing recorded
-- which time those doses belonged to.

-- AlterTable
ALTER TABLE "medicine_logs" ADD COLUMN "medicine_name" TEXT,
ADD COLUMN "dosage" TEXT,
ADD COLUMN "scheduled_slot" TEXT;

-- Backfill
UPDATE "medicine_logs"
SET "medicine_name" = "medicine_regimens"."name",
    "dosage" = "medicine_regimens"."dosage"
FROM "medicine_regimens"
WHERE "medicine_logs"."regimen_id" = "medicine_regimens"."id";
