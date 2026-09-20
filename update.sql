ALTER TABLE "User" RENAME COLUMN "email" TO "username";
ALTER INDEX IF EXISTS "User_email_key" RENAME TO "User_username_key";
