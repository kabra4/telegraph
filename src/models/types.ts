type ITgUser = {
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
  remainder_options: RemainderOptions;
  superuser: boolean;
  last_active: Date;
  is_currently_doing: string;
};

type RemainderOptions = {
  repeat: boolean;
  repeat_is_checked: boolean;
  repeat_cycle: string;
  repeat_pattern: string;
  date: string;
  checked_dates: string[];
  time: string;
  beforehand_selected: boolean;
  has_beforehand: string;
  beforehand_time: string;
};

type IGroup = {
  id: string | undefined;
  created: string | undefined;
  updated: string | undefined;
  tg_id: string;
  name: string;
  description: string;
  tg_username: string;
  language: string;
};

type IGoal = {
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

type IRepeatScheme = {
  id: string | undefined;
  created: string | undefined;
  updated: string | undefined;
  months_of_year: string[];
  days_of_week: string[];
  days_of_month: string[];
  times_of_day: string;
  interval_minutes: number;
};

type IRemainder = {
  id: string | undefined;
  created: string | undefined;
  updated: string | undefined;
  beforehand_remainder_owner_id: string;
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

// export all types
export { ITgUser, IGroup, IGoal, IRepeatScheme, IRemainder, RemainderOptions };
