/*
  Warnings:

  - The values [NEUTRAL,ANXIETY] on the enum `MoodComponentOption` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
DELETE FROM "mood_components" WHERE "component" IN ('NEUTRAL', 'ANXIETY');
CREATE TYPE "MoodComponentOption_new" AS ENUM ('JOY', 'ANGER', 'SADNESS', 'FEAR', 'GUILT', 'FRUSTRATION', 'CALM', 'MOTIVATED', 'TIREDNESS', 'GRATITUDE', 'FOCUS', 'RESTLESS', 'RELAXED', 'OVERWHELMED');
ALTER TABLE "mood_components" ALTER COLUMN "component" TYPE "MoodComponentOption_new" USING ("component"::text::"MoodComponentOption_new");
ALTER TYPE "MoodComponentOption" RENAME TO "MoodComponentOption_old";
ALTER TYPE "MoodComponentOption_new" RENAME TO "MoodComponentOption";
DROP TYPE "public"."MoodComponentOption_old";
COMMIT;
