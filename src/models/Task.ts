// TaskModel class extends Model class
// uses ITask interface
import Model from "./Model";
import { IRemainder } from "./types";

export default class Remainder extends Model {
  public declare data: IRemainder;
  // the constructor of the task model
  // takes the id of the task model
  constructor(id: string = "", collectionName: string = "remainders") {
    super(id, collectionName);
  }
}
