import { Prisma } from "@prisma/client";
import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import { User as userType } from "@prisma/client";

type TgUserData = {
    id: string | undefined;
    created: string | undefined;
    updated: string | undefined;
    tg_id: string;
    tg_username: string;
    name: string;
    surename: string;
    phone_number: string;
    language: string;
    active: boolean;
    reminder_options: UserSelectedOptions;
    superuser: boolean;
    last_active: Date;
    is_currently_doing: string;
};

type userProperties = {
    name?: string;
    last_name?: string;
    username?: string;
    phone_number?: number;
    language?: string;
    active?: boolean;
    currently_doing?: string;
    task_options?: { [key: string]: any };
    superuser?: boolean;
};

type TaskProperties = {
    is_beforehand?: boolean | null;
    beforehand_owner_id?: number | null;
    name?: string | null;
    chat_id?: number | null;
    user_id?: number | null;
    group_id?: number | null;
    hobby_id?: number | null;
    is_active?: boolean | null;
    trigger_timestamp?: Date | null;
    last_triggered_timestamp?: Date | null;
    trigger_count?: number | null;
    max_trigger_count?: number | null;
    action_type?: string | null;
    has_beforehand_notification?: boolean | null;
    beforehand_seconds?: number | null;
    content_text?: string | null;
};

type RepeatSchemeProperties = {
    days_of_week?: number[];
    days_of_month?: number[];
    trigger_time?: string[];
    interval_minutes?: number | null;
    tasks_id?: number;
    is_repeatable?: boolean | null;
    repeat_type?: string | null;
};

type ChatProperties = {
    name?: string;
    language?: string;
    active?: boolean;
    type?: string;
};
type UserSelectedOptions = {
    task_id?: number;
    name?: string;
    repeat?: boolean;
    repeat_cycle?: string;
    repeat_pattern?: string;
    chat_id?: number;
    hobby_id?: number;
    date?: string;
    checked_days?: string[];
    time_list?: string[];
    interval_seconds?: number;
    action_type?: string;
    has_beforehand?: boolean;
    beforehand_time?: number;
    max_trigger_count?: number;

    hobby_answers?: string[];
};

type HobbyProperties = {
    name?: string;
    user_id?: number;
    answers?: string[];
};

type GroupData = {
    id: string | undefined;
    created: string | undefined;
    updated: string | undefined;
    tg_id: string;
    name: string;
    description: string;
    tg_username: string;
    language: string;
};

type GoalData = {
    id: string | undefined;
    created: string | undefined;
    updated: string | undefined;
    name: string;
    success_count: number;
    total_count: number;
    streak_count: number;
    last_success: Date;
    user_id: string;
};

type RepeatSchemeData = {
    id: string | undefined;
    created: string | undefined;
    updated: string | undefined;
    months_of_year: string[];
    days_of_week: string[];
    days_of_month: string[];
    times_of_day: string;
    interval_minutes: number;
};

type ReminderData = {
    id: string | undefined;
    created: string | undefined;
    updated: string | undefined;
    beforehand_reminder_owner_id: string;
    name: string;
    user_id: string;
    is_repeatable: true;
    repeat_scheme_id: string;
    planned_on: Date;
    trigger_timestamp: number;
    last_trigger_timestamp: number;
    trigger_count: number;
    action_type:
        | "message"
        | "delete"
        | "notify_all"
        | "beforehand_notification"
        | "get_goal_status";
    has_beforehand_notification: true;
    beforehand_seconds: number;
    hobby_id: string;
    content: string;
};

type commandCtx = NarrowedContext<
    Context<Update>,
    {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
    }
>;

type actionCtx = NarrowedContext<
    Context<Update> & { match: RegExpExecArray },
    Update.CallbackQueryUpdate<CallbackQuery>
>;

type hearsCtx = NarrowedContext<
    Context<Update>,
    Update.MessageUpdate & Update.NonChannel & Message.TextMessage
>;

type hearsRegexCtx = NarrowedContext<
    Context<Update> & {
        match: RegExpExecArray;
    },
    {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
    }
>;

type startCtx = Context<{
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
}> &
    Omit<Context<Update>, keyof Context<Update>> & {
        startPayload: string;
    };

type helpCtx = NarrowedContext<
    Context<Update>,
    {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
    }
>;

type textMessageCtx = NarrowedContext<
    Context<Update>,
    Update.MessageUpdate<Record<"text", {}> & Message.TextMessage>
>;

// export all types
export {
    TgUserData,
    GroupData,
    GoalData,
    RepeatSchemeData,
    ReminderData,
    UserSelectedOptions,
    commandCtx,
    actionCtx,
    hearsCtx,
    hearsRegexCtx,
    userProperties,
    ChatProperties,
    startCtx,
    helpCtx,
    textMessageCtx,
    TaskProperties,
    RepeatSchemeProperties,
    HobbyProperties,
};
