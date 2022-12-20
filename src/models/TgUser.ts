// TgUsersModel is a model for the tg_users table

import Model from "./Model";
import { ITgUser } from "./types";

export default class TgUser extends Model {
  public declare data: ITgUser;
  // the constructor of the tg user model
  // takes the id of the tg user model
  constructor(id: string = "", collectionName: string = "tg_users") {
    super(id, collectionName);
  }

  // the function to get the tg user by the telegram id
  // takes the telegram id
  // returns the tg user
  public async getByTgId(tgId: string | number): Promise<ITgUser> {
    try {
      return await this.collection.getFirstListItem(`tg_id="${tgId}"`);
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

  public async setByTgId(tgId: string | number, data: ITgUser): Promise<void> {
    try {
      await this.getByTgId(tgId).then((res) => {
        if (res) {
          this.data = res;
          if (res.id) {
            this.id = res.id;
          }
          // this.update(data);
        }
      });
    } catch (err) {
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
    // return await this.update(this.getIdByTgId(tgId), { language: lang });
  }

  public async getLocaleByTgId(tgId: number | string): Promise<string> {
    const res = await this.getByTgId(tgId);
    return res?.language;
  }
}
