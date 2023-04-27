/*
  Warnings:

  - You are about to drop the `Goal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_task_id_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_group_id_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "RepeatScheme" ADD COLUMN     "custom_time" TEXT[];

-- DropTable
DROP TABLE "Goal";

-- DropTable
DROP TABLE "Group";

-- CreateTable
CREATE TABLE "Hobby" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "name" TEXT,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "Hobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HobbyLog" (
    "id" SERIAL NOT NULL,
    "hobby_id" INTEGER NOT NULL,
    "response" TEXT,
    "registered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HobbyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "chat_id" INTEGER,
    "content" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hobby_task_id_key" ON "Hobby"("task_id");

-- AddForeignKey
ALTER TABLE "Hobby" ADD CONSTRAINT "Hobby_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hobby" ADD CONSTRAINT "Hobby_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HobbyLog" ADD CONSTRAINT "HobbyLog_hobby_id_fkey" FOREIGN KEY ("hobby_id") REFERENCES "Hobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
