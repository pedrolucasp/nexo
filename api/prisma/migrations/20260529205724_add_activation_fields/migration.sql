-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activation_code" TEXT,
ADD COLUMN     "activation_code_expires_at" TIMESTAMP(3),
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false;
