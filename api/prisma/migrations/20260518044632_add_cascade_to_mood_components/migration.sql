-- DropForeignKey
ALTER TABLE "mood_components" DROP CONSTRAINT "mood_components_mood_id_fkey";

-- AddForeignKey
ALTER TABLE "mood_components" ADD CONSTRAINT "mood_components_mood_id_fkey" FOREIGN KEY ("mood_id") REFERENCES "moods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
