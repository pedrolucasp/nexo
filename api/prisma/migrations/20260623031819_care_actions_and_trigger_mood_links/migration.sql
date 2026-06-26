/*
  Warnings:

  - You are about to drop the `interventions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CareActionType" AS ENUM ('MEDICINE', 'APPOINTMENT', 'ACTIVITY');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('ANALYST', 'PSYCHIATRIST', 'GP', 'NUTRITIONIST', 'PHYSIOTHERAPIST', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WALK', 'YOGA', 'GYM', 'MEDITATION', 'SOCIAL', 'CREATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "MedicinePeriodicity" AS ENUM ('ONCE', 'DAILY', 'TWICE_DAILY', 'THREE_TIMES_DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TriggerType" ADD VALUE 'THERAPY';
ALTER TYPE "TriggerType" ADD VALUE 'INTERNAL';

-- DropForeignKey
ALTER TABLE "interventions" DROP CONSTRAINT "interventions_user_id_fkey";

-- AlterTable
ALTER TABLE "sleep_records" ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "interventions";

-- DropEnum
DROP TYPE "InterventionType";

-- CreateTable
CREATE TABLE "trigger_mood_links" (
    "id" SERIAL NOT NULL,
    "trigger_id" INTEGER NOT NULL,
    "mood_id" INTEGER NOT NULL,
    "perceived_impact" INTEGER NOT NULL,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trigger_mood_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_regimens" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "periodicity" "MedicinePeriodicity" NOT NULL,
    "scheduled_at" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicine_regimens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_actions" (
    "id" SERIAL NOT NULL,
    "type" "CareActionType" NOT NULL,
    "moment" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "trigger_id" INTEGER,
    "mood_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_logs" (
    "id" SERIAL NOT NULL,
    "regimen_id" INTEGER,
    "care_action_id" INTEGER NOT NULL,
    "taken_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicine_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "care_action_id" INTEGER NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "duration" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "care_action_id" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trigger_mood_links_trigger_id_mood_id_key" ON "trigger_mood_links"("trigger_id", "mood_id");

-- CreateIndex
CREATE UNIQUE INDEX "medicine_logs_care_action_id_key" ON "medicine_logs"("care_action_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_care_action_id_key" ON "appointments"("care_action_id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_care_action_id_key" ON "activities"("care_action_id");

-- AddForeignKey
ALTER TABLE "trigger_mood_links" ADD CONSTRAINT "trigger_mood_links_trigger_id_fkey" FOREIGN KEY ("trigger_id") REFERENCES "triggers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trigger_mood_links" ADD CONSTRAINT "trigger_mood_links_mood_id_fkey" FOREIGN KEY ("mood_id") REFERENCES "moods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_regimens" ADD CONSTRAINT "medicine_regimens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_actions" ADD CONSTRAINT "care_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_actions" ADD CONSTRAINT "care_actions_trigger_id_fkey" FOREIGN KEY ("trigger_id") REFERENCES "triggers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_actions" ADD CONSTRAINT "care_actions_mood_id_fkey" FOREIGN KEY ("mood_id") REFERENCES "moods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_logs" ADD CONSTRAINT "medicine_logs_regimen_id_fkey" FOREIGN KEY ("regimen_id") REFERENCES "medicine_regimens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_logs" ADD CONSTRAINT "medicine_logs_care_action_id_fkey" FOREIGN KEY ("care_action_id") REFERENCES "care_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_care_action_id_fkey" FOREIGN KEY ("care_action_id") REFERENCES "care_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_care_action_id_fkey" FOREIGN KEY ("care_action_id") REFERENCES "care_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
