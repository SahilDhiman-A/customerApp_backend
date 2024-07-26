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
  collection: "user"
};

const schemaDefination = new Schema(
  {
    mobile: { type: String, default: null },
    email: { type: String, default: null },
    login_type : { type: String, default: 'email' },
    user_type: { type: String, default: 'user' },
    country_code: { type: String, default: '+91' },
    password: { type: String, default: null },
    device_info: [
      {
        device_type: {type: String, default: null},
        device_token: {type: String, default: null}
      }
    ],
    personal_info: {
      user_name: { type: String, default: null },
      // last_name: { type: String, default: null },
      profile_img: { type: String, default: null },
      city: { type: String, default: null },
      lat: { type: Number, default: null },
      long: { type: Number, default: null }
    },
    is_deleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    created_at: { type: Number, default: Date.now },
    updated_at: { type: Number, default: Date.now },
  },
  options
);

const modelDefination = Mongoose.model("user", schemaDefination);

export default class User {
  constructor() {
    this.model = modelDefination;
  }
  static get modelName() {
    return modelDefination.modelName;
  }
}
