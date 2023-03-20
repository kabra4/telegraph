/*
  Warnings:

  - You are about to drop the column `surename` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "surename",
ADD COLUMN     "last_name" TEXT;
