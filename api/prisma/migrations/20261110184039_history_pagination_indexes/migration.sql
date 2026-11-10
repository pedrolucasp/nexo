-- CreateIndex
CREATE INDEX "moods_user_id_moment_idx" ON "moods"("user_id", "moment");

-- CreateIndex
CREATE INDEX "triggers_user_id_moment_idx" ON "triggers"("user_id", "moment");

-- CreateIndex
CREATE INDEX "care_actions_user_id_moment_idx" ON "care_actions"("user_id", "moment");

-- CreateIndex
CREATE INDEX "sleep_records_user_id_date_idx" ON "sleep_records"("user_id", "date");
