import Boom from "boom";
import Category from "../../../models/category";
import mongoose from "mongoose";
import { has } from "config";
import Config from "config";

export class CategoryService {
  addNewSegmen(query, done) {
    let _category = new Category();
    _category.model.insertMany(
      query,
      (err, result) => {
        if (err) {
          return done(err);
        }
        return done(null, result);
      });
  }
  modifyCategory(query, done) {
    let _category = new Category();
    let userQuery = ({
      _id: query.id
    })
    _category.model.findOneAndUpdate(
      userQuery,
      {
        $set:
          { "name": query.name }
      },
      (err, result) => {
        if (err) {
          return done(err);
        } else {
          return done(null, result);
        }
      }
    )
  }
  getCategoryBySegmentID(query, done) {
    let _category = new Category();
    let userQuery = ({
      segment_id: query.id
    })
    _category.model.find(
      userQuery,
      (err, result) => {
        if (err) {
          return done(err);
        } else {
          return done(null, result);
        }
      }
    )
  }
  getCategoryList(query, done) {
    let _category = new Category();
    _category.model.aggregate([
      {
        $lookup: {
          from: "segment",
          localField: "segment_id",
          foreignField: "_id",
          as: "segment_info"
        }
      },
      {
        $unwind: {
          path: "$segment_info",
          preserveNullAndEmptyArrays: true
        }
      }
    ], (err, result) => {
      if (err) {
        return done(err);
      } else {
        return done(null, result);
      }
    })
  }
  getCategoryByID(query, done) {
    let _category = new Category();
    _category.model.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(query.id) } },
      {
        $lookup: {
          from: "segment",
          localField: "segment_id",
          foreignField: "_id",
          as: "segment_info"
        }
      },
      {
        $unwind: {
          path: "$segment_info",
          preserveNullAndEmptyArrays: true
        }
      }
    ], (err, result) => {
      if (err) {
        return done(err);
      } else {
        return done(null, result);
      }
    })
  }

  activateDeactivate(query, done) {
    let _category = new Category();
    _category.model.findOneAndUpdate(
      { _id: query.id },
      {
        $set:
          { is_active: query.is_active }
      },
      { new: true },
      (err, result) => {
        if (err) {
          return done(err);
        } else {
          return done(null, result);
        }
      }
    )
  }


}

export default new CategoryService();
