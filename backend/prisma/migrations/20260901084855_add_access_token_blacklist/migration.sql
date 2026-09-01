-- CreateTable
CREATE TABLE "RevokedAccessToken" (
    "id" TEXT NOT NULL,
    "jti" VARCHAR(64) NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevokedAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RevokedAccessToken_jti_key" ON "RevokedAccessToken"("jti");

-- CreateIndex
CREATE INDEX "RevokedAccessToken_userId_idx" ON "RevokedAccessToken"("userId");

-- CreateIndex
CREATE INDEX "RevokedAccessToken_expiresAt_idx" ON "RevokedAccessToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "RevokedAccessToken" ADD CONSTRAINT "RevokedAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
