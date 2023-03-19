import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";

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
  reminder_options: ReminderOptions;
  superuser: boolean;
  last_active: Date;
  is_currently_doing: string;
};

type ReminderOptions = {
  name: string;
  repeat: boolean;
  repeat_is_checked: boolean;
  repeat_cycle: string;
  repeat_pattern: string;
  date: string;
  checked_days: string[];
  time: string;
  time_list: string[];
  beforehand_selected: boolean;
  has_beforehand: boolean;
  beforehand_time: string;
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
  group_id: string;
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
  goal_id: string;
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

// export all types
export {
  TgUserData,
  GroupData,
  GoalData,
  RepeatSchemeData,
  ReminderData,
  ReminderOptions,
  commandCtx,
  actionCtx,
  hearsCtx,
  hearsRegexCtx,
};
