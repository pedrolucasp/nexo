-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('SOCIAL', 'ENVIRONMENTAL', 'EMOTIONAL', 'PHYSICAL', 'OTHER');

-- CreateTable
CREATE TABLE "triggers" (
    "id" SERIAL NOT NULL,
    "comment" TEXT,
    "category" "TriggerType" NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "triggers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
