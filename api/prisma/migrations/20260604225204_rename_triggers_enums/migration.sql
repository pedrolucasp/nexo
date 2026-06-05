/*
  Warnings:

  - The values [ENVIRONMENTAL,EMOTIONAL] on the enum `TriggerType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TriggerType_new" AS ENUM ('SOCIAL', 'WORK', 'HEALTH', 'PHYSICAL', 'FAMILY', 'OTHER');
ALTER TABLE "triggers" ALTER COLUMN "category" TYPE "TriggerType_new" USING ("category"::text::"TriggerType_new");
ALTER TYPE "TriggerType" RENAME TO "TriggerType_old";
ALTER TYPE "TriggerType_new" RENAME TO "TriggerType";
DROP TYPE "public"."TriggerType_old";
COMMIT;
