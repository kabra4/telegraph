// TgUsersModel is a model for the tg_users table

import Model from "./Model";
import { TgUserData } from "./types";

export default class TgUser extends Model {
  public declare data: TgUserData;
  constructor(id?: string) {
    super(id, "tg_users");
  }

  public static async getTgUserByTgId(tg_id: number): Promise<TgUser> {
    const tg_user = new TgUser();
    await tg_user.setByTgId(tg_id);
    return tg_user;
  }

  public resetReminderOptions(): void {
    this.data.reminder_options = {
      name: "",
      repeat: false,
      repeat_is_checked: false,
      repeat_cycle: "",
      repeat_pattern: "",
      date: "",
      checked_days: [],
      time: "",
      time_list: [],
      beforehand_selected: false,
      has_beforehand: false,
      beforehand_time: "",
    };
  }

  public async createNewUser(
    tg_id: string | number,
    name: string,
    language: string,
    tg_username: string = "",
    surename: string = "",
    phone_number: string = "",
    active: boolean = false,
    reminder_options: {} = {},
    superuser: boolean = false,
    last_active: Date = new Date(),
    is_currently_doing: string = ""
  ): Promise<TgUserData> {
    const languages = ["en", "ru", "uz"];
    if (!languages.includes(language)) {
      language = "en";
    }
    const user_data = {
      tg_id: tg_id.toString(),
      name: name,
      language: language,
      tg_username: tg_username,
      surename: surename,
      phone_number: phone_number,
      active: active,
      reminder_options: reminder_options,
      superuser: superuser,
      last_active: last_active,
      is_currently_doing: is_currently_doing,
    };
    this.data = await this.create(user_data);
    return this.data;
  }

  // the function to get the tg user by the telegram id
  // takes the telegram id
  // returns the tg user
  public async getDataByTgId(
    tgId: string | number,
    args: {} = {}
  ): Promise<TgUserData> {
    try {
      return (await this.getFirstListItem(
        `tg_id="${tgId}"`,
        args
      )) as TgUserData;
    } catch (err) {
      // console.error(err);
      return {} as TgUserData;
    }
    // return await this.collection.getFirstListItem(`tg_id="${tgId}"`);
  }

  public async getByTgId(tgId: string | number): Promise<void> {
    try {
      await this.getDataByTgId(tgId).then((res) => {
        if (res) {
          this.data = res;
          if (res.id) {
            this.id = res.id;
          }
        }
      });
    } catch (err) {
      return;
    }
  }

  public async getIdByTgId(tgId: string | number): Promise<string> {
    try {
      const res = await this.getDataByTgId(tgId);
      if (res && res.id) {
        return res.id;
      }
      return "";
    } catch (err) {
      return "";
    }
  }

  public async setByTgId(tgId: number, args?: {}): Promise<void> {
    try {
      await this.getDataByTgId(tgId, args).then((res) => {
        if (res) {
          this.data = res;
          if (res.id) {
            this.id = res.id;
          }
        }
      });
    } catch (err) {
      console.log("line");
      return;
    }
  }
  // the fn to update the language of the tg user
  public async updateLanguageById(id: any, lang: any, data: any = {}) {
    if (data) {
      data.language = lang;
      return await this.update(id, data);
    } else {
      this.getOne(id).then((res) => {
        if (res) {
          res.language = lang;
          this.update(id, res);
        }
      });
    }
  }

  // the fn to update the language of the tg user
  public async updateLanguageByTgId(tgId: number | string, lang: string) {
    this.getDataByTgId(tgId).then((res) => {
      if (res) {
        this.updateLanguageById(res.id, lang, res);
      }
    });
  }

  public async getLocaleByTgId(tgId: number | string): Promise<string> {
    const res = await this.getDataByTgId(tgId);
    return res?.language;
  }

  public toggleDaysSelection(day: string): void {
    const { checked_days } = this.data.reminder_options;
    const index = checked_days.indexOf(day);

    if (index >= 0) {
      // If the day is already in the array, remove it
      checked_days.splice(index, 1);
    } else {
      // If the day is not in the array, add it
      checked_days.push(day);
    }
    this.save();
  }
}
