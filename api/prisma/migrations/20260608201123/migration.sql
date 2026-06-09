/*
  Warnings:

  - A unique constraint covering the columns `[user_id,type,period_start]` on the table `insights` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "insights_user_id_type_period_start_key" ON "insights"("user_id", "type", "period_start");
