-- CreateEnum
CREATE TYPE "ParkingEventType" AS ENUM ('ENTRY', 'EXIT');

-- CreateEnum
CREATE TYPE "ParkingAccessResult" AS ENUM ('GRANTED', 'DENIED');

-- CreateTable
CREATE TABLE "ParkingEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parkingLotId" TEXT NOT NULL,
    "reservationId" TEXT,
    "type" "ParkingEventType" NOT NULL,
    "result" "ParkingAccessResult" NOT NULL,
    "reason" VARCHAR(255),
    "occurredAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParkingEvent_userId_occurredAt_idx" ON "ParkingEvent"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "ParkingEvent_parkingLotId_occurredAt_idx" ON "ParkingEvent"("parkingLotId", "occurredAt");

-- CreateIndex
CREATE INDEX "ParkingEvent_reservationId_occurredAt_idx" ON "ParkingEvent"("reservationId", "occurredAt");

-- CreateIndex
CREATE INDEX "ParkingEvent_result_occurredAt_idx" ON "ParkingEvent"("result", "occurredAt");

-- AddForeignKey
ALTER TABLE "ParkingEvent" ADD CONSTRAINT "ParkingEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingEvent" ADD CONSTRAINT "ParkingEvent_parkingLotId_fkey" FOREIGN KEY ("parkingLotId") REFERENCES "ParkingLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingEvent" ADD CONSTRAINT "ParkingEvent_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
