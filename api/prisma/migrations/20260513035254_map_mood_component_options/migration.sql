/*
  Warnings:

  - You are about to drop the column `comment` on the `mood_components` table. All the data in the column will be lost.
  - Added the required column `component` to the `mood_components` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MoodComponentOption" AS ENUM ('JOY', 'NEUTRAL', 'ANGER', 'SADNESS', 'ANXIETY', 'GRATITUDE', 'FOCUS', 'TIREDNESS');

-- AlterTable
ALTER TABLE "mood_components" DROP COLUMN "comment",
ADD COLUMN     "component" "MoodComponentOption" NOT NULL;
