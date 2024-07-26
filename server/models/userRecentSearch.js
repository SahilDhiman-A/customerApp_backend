import Mongoose, { Schema } from "mongoose";

const options = {
  toJSON: {
    transform: (doc, obj) => {
      delete obj.__v;
      delete obj.id;
      return obj;
    },
    virtuals: false
  },
  strict: false,
  collection: "user_recent_search"
};

const schemaDefination = new Schema(
  {
    can_id: { type: String, require: true },
    search_info: [
      {
        type: String, require: true
      }
    ],
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  options
);

const modelDefination = Mongoose.model("user_recent_search", schemaDefination);

export default class User {
  constructor() {
    this.model = modelDefination;
  }
  static get modelName() {
    return modelDefination.modelName;
  }
}
