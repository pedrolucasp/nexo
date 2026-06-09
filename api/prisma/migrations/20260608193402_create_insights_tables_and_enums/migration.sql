-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('MOOD_TREND', 'ENERGY_SLEEP_CORRELATION', 'TRIGGER_PATTERN', 'WEEKLY_SUMMARY', 'STREAK');

-- CreateEnum
CREATE TYPE "InsightPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "insights" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "InsightType" NOT NULL,
    "period" "InsightPeriod" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
