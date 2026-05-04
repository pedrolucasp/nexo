-- CreateTable
CREATE TABLE "sleep_records" (
    "id" SERIAL NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL,
    "annotations" TEXT,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "sleep_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sleep_records" ADD CONSTRAINT "sleep_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
