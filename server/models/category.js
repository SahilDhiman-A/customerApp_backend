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
  collection: "category"
};

const schemaDefination = new Schema(
  {
    name: { type: String, default: null },
    segment_id: { type: Schema.Types.ObjectId, require: true },
    is_deleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  options
);

const modelDefination = Mongoose.model("category", schemaDefination);

export default class User {
  constructor() {
    this.model = modelDefination;
  }
  static get modelName() {
    return modelDefination.modelName;
  }
}
