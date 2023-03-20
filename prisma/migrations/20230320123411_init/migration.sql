-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL,
    "language" TEXT,
    "active" BOOLEAN,
    "last_active" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "name" TEXT,
    "surename" TEXT,
    "username" TEXT,
    "phone_number" INTEGER,
    "language" TEXT,
    "task_options" JSONB,
    "active" BOOLEAN,
    "last_active" TIMESTAMP(3),
    "superuser" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL,
    "username" TEXT,
    "language" TEXT,
    "admins" TEXT[],
    "active" BOOLEAN,
    "last_active" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_beforehand" BOOLEAN,
    "beforehand_owner_id" INTEGER,
    "name" TEXT,
    "chat_id" INTEGER,
    "user_id" INTEGER,
    "group_id" INTEGER,
    "is_repeatable" BOOLEAN,
    "repeat_type" TEXT,
    "trigger_timestamp" TIMESTAMP(3),
    "last_triggered_timestamp" TIMESTAMP(3),
    "trigger_count" INTEGER,
    "max_trigger_count" INTEGER,
    "action_type" TEXT,
    "has_beforehand_notification" BOOLEAN,
    "beforehand_seconds" INTEGER,
    "goal_id" INTEGER,
    "content_text" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "name" TEXT,
    "success_count" INTEGER,
    "total_count" INTEGER,
    "streak_count" INTEGER,
    "last_success" TIMESTAMP(3),
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepeatScheme" (
    "id" SERIAL NOT NULL,
    "months_of_year" INTEGER[],
    "days_of_week" INTEGER[],
    "days_of_month" INTEGER[],
    "trigger_time" TEXT,
    "interval_minutes" INTEGER,
    "tasks_id" INTEGER NOT NULL,

    CONSTRAINT "RepeatScheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_beforehand_owner_id_key" ON "Task"("beforehand_owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_task_id_key" ON "Goal"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "RepeatScheme_tasks_id_key" ON "RepeatScheme"("tasks_id");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_beforehand_owner_id_fkey" FOREIGN KEY ("beforehand_owner_id") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepeatScheme" ADD CONSTRAINT "RepeatScheme_tasks_id_fkey" FOREIGN KEY ("tasks_id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
