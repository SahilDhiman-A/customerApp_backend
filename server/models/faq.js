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
  collection: "faq"
};

const schemaDefination = new Schema(
  {
    category_id: { type: Schema.Types.ObjectId, require: true },
    question: { type: String, default: null },
    answer: { type: String, default: null },
    link: { type: String, default: null },
    image_url: { type: String, default: null },
    video_url: { type: String, default: null },
    view_count: { type: Number, default: 0 },
    thumb_up: [
      {
        can_id: { type: String, default: null }
      }
    ],
    thumb_down: [
      {
        can_id: { type: String, default: null },
        reason: { type: String, default: null },
      },
    ],
    is_deleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  options
);

const modelDefination = Mongoose.model("faq", schemaDefination);

export default class User {
  constructor() {
    this.model = modelDefination;
  }
  static get modelName() {
    return modelDefination.modelName;
  }
}
