-- CreateTable
CREATE TABLE "WellnessLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waterIntake" DOUBLE PRECISION,
    "sleepHours" DOUBLE PRECISION,
    "steps" INTEGER,
    "exerciseMinutes" INTEGER,
    "calories" INTEGER,
    "weight" DOUBLE PRECISION,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "sugarLevel" DOUBLE PRECISION,
    "mood" TEXT,
    "energyLevel" INTEGER,
    "stressLevel" INTEGER,
    "symptoms" TEXT[],
    "medications" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WellnessLog_userId_date_idx" ON "WellnessLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "WellnessLog" ADD CONSTRAINT "WellnessLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
