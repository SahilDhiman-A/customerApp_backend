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
  collection: "notification"
};

const schemaDefination = new Schema(
  {
    to: { type: String, default: null },
    can_id: { type: String, default: null },
    priority: { type: String, default: null },    
    notification: {
        title: {type: String, default: null},
        body: {type: String, default: null},
        sound: {type: String, default: 'default'},
      },
    data: {
      order_info: ({}),
      xls_data: []
    },
    refrence_id: {type: String, default: null},
    image_url: {type: String, default: null},
    user_file: {type: String, default: null},
    pdf_url: {type: String, default: null},
    is_archieved: { type: Boolean, default: false },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  options
);

const modelDefination = Mongoose.model("notification", schemaDefination);

export default class Notification {
  constructor() {
    this.model = modelDefination;
  }
  static get modelName() {
    return modelDefination.modelName;
  }
}
