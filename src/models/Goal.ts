// GoalModel class extends Model class
// uses IGoal interface
import Model from "./Model";
import { IGoal } from "./types";

export default class Goal extends Model {
  public declare data: IGoal;
  // the constructor of the goal model
  // takes the id of the goal model
  constructor(id: string = "", collectionName: string = "goals") {
    super(id, collectionName);
  }
}
