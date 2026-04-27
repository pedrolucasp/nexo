-- CreateEnum
CREATE TYPE "IntensityLevel" AS ENUM ('LIGHT', 'MODERATE', 'HIGH');

-- CreateTable
CREATE TABLE "moods" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "moment" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anxiety_level" INTEGER NOT NULL,
    "stress_level" INTEGER NOT NULL,
    "energy_level" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "moods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_components" (
    "id" SERIAL NOT NULL,
    "comment" TEXT,
    "intensity" "IntensityLevel" NOT NULL DEFAULT 'LIGHT',
    "mood_id" INTEGER NOT NULL,

    CONSTRAINT "mood_components_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "moods" ADD CONSTRAINT "moods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_components" ADD CONSTRAINT "mood_components_mood_id_fkey" FOREIGN KEY ("mood_id") REFERENCES "moods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
