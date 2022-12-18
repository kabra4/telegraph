// Group model class extends the model class
import Model from "./Model";
import { IGroup } from "./types";

export default class Group extends Model {
  public declare data: IGroup;
  // the constructor of the group model
  // takes the id of the group model
  constructor(id: string = "", collectionName: string = "groups") {
    super(id, collectionName);
  }
}
