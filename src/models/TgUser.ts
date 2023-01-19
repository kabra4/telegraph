// TgUsersModel is a model for the tg_users table

import Model from "./Model";
import { ITgUser } from "./types";

export default class TgUser extends Model {
  public declare data: ITgUser;
  // the constructor of the tg user model
  // takes the id of the tg user model
  constructor(
    id: string = "",
    collectionName: string = "tg_users",
    tg_id: string | number = ""
  ) {
    super(id, collectionName);
    if (tg_id !== "") {
      this.setByTgId(tg_id);
    }
  }

  public resetReminderOptions(): void {
    this.data.reminder_options = {
      repeat: false,
      repeat_is_checked: false,
      repeat_cycle: "",
      repeat_pattern: "",
      date: "",
      checked_dates: [],
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
  ): Promise<ITgUser> {
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
  public async getByTgId(
    tgId: string | number,
    args: {} = {}
  ): Promise<ITgUser> {
    try {
      return (await this.getFirstListItem(`tg_id="${tgId}"`, args)) as ITgUser;
    } catch (err) {
      // console.error(err);
      return {} as ITgUser;
    }
    // return await this.collection.getFirstListItem(`tg_id="${tgId}"`);
  }

  public async getIdByTgId(tgId: string | number): Promise<string> {
    try {
      const res = await this.getByTgId(tgId);
      if (res && res.id) {
        return res.id;
      }
      return "";
    } catch (err) {
      return "";
    }
  }

  public async setByTgId(tgId: string | number, args?: {}): Promise<void> {
    try {
      await this.getByTgId(tgId, args).then((res) => {
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
    this.getByTgId(tgId).then((res) => {
      if (res) {
        this.updateLanguageById(res.id, lang, res);
      }
    });
  }

  public async getLocaleByTgId(tgId: number | string): Promise<string> {
    const res = await this.getByTgId(tgId);
    return res?.language;
  }
}
