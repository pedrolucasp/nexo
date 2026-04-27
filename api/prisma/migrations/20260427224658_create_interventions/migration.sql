-- CreateEnum
CREATE TYPE "InterventionType" AS ENUM ('MEDICATION', 'THERAPY', 'MEDITATION', 'EXERCISE', 'CONVERSATION');

-- CreateTable
CREATE TABLE "interventions" (
    "id" SERIAL NOT NULL,
    "comment" TEXT,
    "intervention_type" "InterventionType" NOT NULL,
    "eficacy" INTEGER NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
