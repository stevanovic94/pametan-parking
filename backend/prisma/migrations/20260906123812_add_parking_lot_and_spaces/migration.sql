-- CreateEnum
CREATE TYPE "ParkingSpaceOccupancy" AS ENUM ('UNKNOWN', 'FREE', 'OCCUPIED');

-- CreateTable
CREATE TABLE "ParkingLot" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingSpace" (
    "id" TEXT NOT NULL,
    "parkingLotId" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "occupancyStatus" "ParkingSpaceOccupancy" NOT NULL DEFAULT 'UNKNOWN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingSpace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParkingLot_isActive_idx" ON "ParkingLot"("isActive");

-- CreateIndex
CREATE INDEX "ParkingSpace_parkingLotId_idx" ON "ParkingSpace"("parkingLotId");

-- CreateIndex
CREATE INDEX "ParkingSpace_parkingLotId_isActive_occupancyStatus_idx" ON "ParkingSpace"("parkingLotId", "isActive", "occupancyStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingSpace_parkingLotId_code_key" ON "ParkingSpace"("parkingLotId", "code");

-- AddForeignKey
ALTER TABLE "ParkingSpace" ADD CONSTRAINT "ParkingSpace_parkingLotId_fkey" FOREIGN KEY ("parkingLotId") REFERENCES "ParkingLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
