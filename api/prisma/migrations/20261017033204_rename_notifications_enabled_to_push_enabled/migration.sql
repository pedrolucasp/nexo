-- The preference gates push only, so it is named for what it does. A rename,
-- not a drop and add: the column keeps its values.
ALTER TABLE "users" RENAME COLUMN "notifications_enabled" TO "push_enabled";
