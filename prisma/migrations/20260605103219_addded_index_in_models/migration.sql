-- CreateIndex
CREATE INDEX "Movie_createdAt_releaseYear_idx" ON "Movie"("createdAt", "releaseYear");

-- CreateIndex
CREATE INDEX "User_createdAt_isVerified_idx" ON "User"("createdAt", "isVerified");
