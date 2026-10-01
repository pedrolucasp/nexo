-- Codes are issued for a five-minute window and are not unique today, so an
-- existing database can hold the same code against several users. Keep the most
-- recently issued holder of each code and clear the rest, together with their
-- expiry, so a cleared user is reissued a code on their next login.
UPDATE "users"
SET "activation_code" = NULL,
    "activation_code_expires_at" = NULL
WHERE "activation_code" IS NOT NULL
  AND "id" NOT IN (
    SELECT DISTINCT ON ("activation_code") "id"
    FROM "users"
    WHERE "activation_code" IS NOT NULL
    ORDER BY "activation_code", "updated_at" DESC
  );

-- CreateIndex
CREATE UNIQUE INDEX "users_activation_code_key" ON "users"("activation_code");
