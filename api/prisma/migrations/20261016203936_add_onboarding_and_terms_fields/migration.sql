-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboarding_seen_at" TIMESTAMP(3),
ADD COLUMN     "terms_accepted_at" TIMESTAMP(3),
ADD COLUMN     "terms_version" TEXT;
