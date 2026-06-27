/*
  Warnings:

  - You are about to drop the `reminders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "daily_reminder_time" TEXT,
ADD COLUMN     "notifications_enabled" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "reminders";
