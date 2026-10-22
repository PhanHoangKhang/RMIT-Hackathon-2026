-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "problemUnderstanding" INTEGER NOT NULL,
    "solutionQuality" INTEGER NOT NULL,
    "execution" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "feedback" VARCHAR(5000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_portfolioId_createdAt_idx" ON "Review"("portfolioId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewerId_portfolioId_key" ON "Review"("reviewerId", "portfolioId");
