// RepeatSchemeModel class extends the Model class
// uses the IRepeatScheme interface
import Model from "./Model";
import { RepeatSchemeData } from "./types";

export default class RepeatScheme extends Model {
  public declare data: RepeatSchemeData;
  // the constructor of the repeat scheme model
  // takes the id of the repeat scheme model
  constructor(id: string = "", collectionName: string = "repeat_schemes") {
    super(id, collectionName);
  }
}
