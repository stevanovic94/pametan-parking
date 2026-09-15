/*
  Warnings:

  - You are about to alter the column `rfidUid` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(32)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "rfidUid" SET DATA TYPE VARCHAR(32);
