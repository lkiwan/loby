-- AlterTable
ALTER TABLE "Friend" ADD COLUMN "plays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastPlayedAt" TIMESTAMP(3);
-- CreateIndex
CREATE INDEX "Friend_userId_plays_idx" ON "Friend"("userId" DESC, "plays" DESC);
-- CreateIndex (adjust)
DROP INDEX IF EXISTS "Friend_userId_plays_idx";
CREATE INDEX "Friend_userId_plays_sort_Desc_idx" ON "Friend"("userId", "plays" DESC);
