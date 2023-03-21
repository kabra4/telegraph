/*
  Warnings:

  - You are about to drop the column `months_of_year` on the `RepeatScheme` table. All the data in the column will be lost.
  - You are about to drop the column `is_repeatable` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `repeat_type` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RepeatScheme" DROP COLUMN "months_of_year",
ADD COLUMN     "is_repeatable" BOOLEAN,
ADD COLUMN     "repeat_type" TEXT,
ADD COLUMN     "trigger_date" TEXT;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "is_repeatable",
DROP COLUMN "repeat_type";
