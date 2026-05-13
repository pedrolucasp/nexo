/*
  Warnings:

  - You are about to drop the column `description` on the `moods` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BaseMoodOption" AS ENUM ('SAD', 'NEUTRAL', 'GOOD', 'GREAT', 'ANGRY');

-- AlterTable
ALTER TABLE "moods" DROP COLUMN "description",
ADD COLUMN     "annotation" TEXT,
ADD COLUMN     "selected_mood" "BaseMoodOption" NOT NULL DEFAULT 'GOOD';
