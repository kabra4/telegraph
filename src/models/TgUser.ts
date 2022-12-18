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
}
