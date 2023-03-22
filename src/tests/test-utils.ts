import User from "../models/User";
import Task from "../models/Task";
import { SelectedTaskOptions } from "../models/types";

export async function createUser(
    id: number,
    name: string,
    last_name: string = "",
    username: string = "",
    language: string = "ru"
) {
    const user = new User();
    await user.create(id, name, last_name, username, language);
    return user;
}

export const testArgs = [
    {
        user_id: 1,
        user_name: "Test",
        user_last_name: "User",
        user_username: "testuser",
        user_language: "ru",
        task_options: [
            {
                name: "Test task",
                repeat: true,
                repeat_cycle: "daily",
                time: "12:00",
                action_type: "task",
                content_text: "Test task content",
            },
            {
                name: "Test task 2",
                repeat: true,
                repeat_cycle: "daily",
                time: "05:00",
                action_type: "task",
                content_text: "Test task content 2",
            },
        ],
        tasks_desired_timestampt: [
            // new Date (tomorrow at 12:00) (should be Date type, not timestamp seconds)
            new Date(2023, 2, 23, 12, 0, 0, 0),
            // new Date (tomorrow at 05:00)
            new Date(2023, 2, 23, 5, 0, 0, 0),
        ],
        beforehand_timestamps: [],
    },
    {
        user_id: 2,
        user_name: "Test 2",
        user_last_name: "User 2",
        user_username: "testuser2",
        user_language: "en",
        task_options: [
            {
                name: "",
                repeat: true,
                repeat_cycle: "weekly",
                time: "12:00",
                action_type: "task",
                content_text: "Test task content 33",
                checked_days: ["1", "2", "6"],
            },
            {
                name: "Test task user 2",
                repeat: true,
                repeat_cycle: "weekly",
                time: "19:29",
                action_type: "task",
                content_text: "Test task content 2",
                checked_days: ["3", "4", "5"],
            },
        ],
        tasks_desired_timestampt: [
            // new Date (25.03.2023 at 12:00)
            new Date(2023, 2, 26, 12, 0, 0, 0),
            // (22.03.2023 at 19:29)
            new Date(2023, 2, 23, 19, 29, 0, 0),
        ],
        beforehand_timestamps: [],
    },
    {
        user_id: 3,
        user_name: "Test user 3",
        user_last_name: "User 3",
        user_username: "testuser3",
        user_language: "uz",
        task_options: [
            {
                name: "Test task user 3",
                repeat: true,
                repeat_cycle: "monthly",
                time: "12:04",
                action_type: "task",
                content_text: "Test task content 3",
                checked_days: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
            },
            {
                name: "Test task user 3 2",
                repeat: true,
                repeat_cycle: "monthly",
                time: "22.04",
                action_type: "task",
                content_text: "Test task content 3 2",
                checked_days: [
                    "20",
                    "21",
                    "22",
                    "23",
                    "24",
                    "25",
                    "26",
                    "27",
                    "28",
                    "29",
                    "30",
                    "31",
                ],
            },
        ],
        tasks_desired_timestampt: [
            // new Date (01.04.2023 at 12:04)
            new Date(2023, 3, 1, 12, 4, 0, 0),
            // new Date (22.03.2023 at 22:04)
            new Date(2023, 2, 22, 22, 4, 0, 0),
        ],
        beforehand_timestamps: [],
    },
    {
        user_id: 4,
        user_name: "Test user 4",
        user_last_name: "User 4",
        user_username: "testuser4",
        user_language: "ru",
        task_options: [
            {
                name: "Test task user 4",
                repeat: true,
                repeat_cycle: "yearly",
                time: "12:04",
                date: "2023-04-01",
                action_type: "task",
                content_text: "Test task content 4",
            },
            {
                name: "Test task user 4 2",
                repeat: true,
                repeat_cycle: "yearly",
                time: "22:04",
                date: "2023-08-22",
                action_type: "task",
                content_text: "Test task content 4 2",
                has_beforehand: true,
                beforehand_time: 600,
            },
        ],
        tasks_desired_timestampt: [
            // new Date (01.04.2023 at 12:04)
            new Date(2023, 3, 1, 12, 4, 0, 0),
            // new Date (22.08.2023 at 22:04)
            new Date(2023, 7, 22, 22, 4, 0, 0),
        ],
        beforehand_timestamps: [
            new Date(),
            // new Date (22.8.2023 at 12:04) - 10 minutes
            new Date(new Date(2023, 7, 22, 22, 4, 0, 0).getTime() - 600000),
        ],
    },
    {
        user_id: 5,
        user_name: "Test user 5",
        user_last_name: "User 5",
        user_username: "testuser5",
        user_language: "en",
        task_options: [
            {
                name: "Test task user 5",
                repeat: false,
                date: "2023-05-01",
                time: "12:04",
                action_type: "task",
                content_text: "Test task content 5",
                has_beforehand: true,
                beforehand_time: 1800,
            },
            {
                name: "Test task user 5 2",
                repeat: false,
                date: "2023-05-09",
                time: "22:04",
                action_type: "task",
                content_text: "Test task content 5 2",
                has_beforehand: false,
            },
        ],
        tasks_desired_timestampt: [
            new Date(2023, 4, 1, 12, 4, 0, 0),
            new Date(2023, 4, 9, 22, 4, 0, 0),
        ],
        beforehand_timestamps: [
            // new Date (01.05.2023 at 12:04) - 30 minutes
            new Date(new Date(2023, 4, 1, 12, 4, 0, 0).getTime() - 1800000),
            new Date(),
        ],
    },
];

const users: User[] = [];

for (let i = 0; i < testArgs.length; i++) {
    const user_args = testArgs[i];
    users.push(
        await createUser(
            user_args.user_id,
            user_args.user_name,
            user_args.user_last_name,
            user_args.user_username,
            user_args.user_language
        )
    );
}

(async () => {
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const task_options = testArgs[i].task_options;

        for (let j = 0; j < task_options.length; j++) {
            const task_args = task_options[j];
            await user.updateTaskOptionProperty(task_args);
            const task = await user.taskFromSelectedTaskOptions(user.id);
            const task_desired_timestamp = testArgs[i].tasks_desired_timestampt[j];
            console.log(i, " - ", j);
            if (task_desired_timestamp.getTime() === task.trigger_timestamp.getTime()) {
                console.log("OK");
            } else {
                console.log("ERROR");
            }
            if (task.beforehand_task) {
                const beforehand_timestamp = testArgs[i].beforehand_timestamps[j];
                if (
                    beforehand_timestamp.getTime() ===
                    task.beforehand_task.trigger_timestamp.getTime()
                ) {
                    console.log("OK", "beforehand");
                } else {
                    console.log("ERROR", "beforehand");
                    console.log(task.beforehand_seconds);
                    console.log(task.trigger_timestamp);
                    console.log(task.beforehand_task.trigger_timestamp);
                }
            }
        }
    }
})();
