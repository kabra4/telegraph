// TaskModel class extends Model class
// uses ITask interface
import Model from "./Model";
import { ITask } from "./types";

export default class Task extends Model {
  public declare data: ITask;
  // the constructor of the task model
  // takes the id of the task model
  constructor(id: string = "", collectionName: string = "tasks") {
    super(id, collectionName);
  }
}
