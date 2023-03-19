// TaskModel class extends Model class
// uses ITask interface
import Model from "./Model";
import { ReminderData } from "./types";

export default class Reminder extends Model {
  public declare data: ReminderData;
  // the constructor of the task model
  // takes the id of the task model
  constructor(id: string = "", collectionName: string = "reminders") {
    super(id, collectionName);
  }
}
