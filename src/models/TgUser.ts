// TgUsersModel is a model for the tg_users table

import Model from "./Model";
import { ITgUser } from "./types";

export default class TgUsers extends Model {
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
}
