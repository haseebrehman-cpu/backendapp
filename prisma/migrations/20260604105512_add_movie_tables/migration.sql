-- CreateEnum
CREATE TYPE "WatchlistStatus" AS ENUM ('PLANNED', 'WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED');

-- AlterTable
ALTER TABLE "MovieWatchlist" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "status" "WatchlistStatus" NOT NULL DEFAULT 'PLANNED';
