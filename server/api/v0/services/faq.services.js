import Boom from "boom";
import FAQ from "../../../models/faq";
import Segment from "../../../models/segment";
import UserRecentSearch from "../../../models/userRecentSearch";
import mongoose from "mongoose";
import { has } from "config";
import Config from "config";

export class FAQService {
  addNewFAQ(query, done) {
    let _faq = new FAQ();
    _faq.model.insertMany(
      query,
      (err, result) => {
        if (err) {
          return done(err);
        }
        return done(null, result);
      });
  }
  bulkUploadFAQ(query, done) {
    let findInput = []
    let _segment = new Segment();
    let _faq = new FAQ();
    for (let index = 0; index < query.length; index++) {
      let element = query[index];
      if (element && element.segment_name && element.category_name && element.question && element.answer)
        _segment.model.aggregate(
          [
            { $match: { name: { $regex: element.segment_name, $options: 'i' }, is_active: true, is_deleted: false } },
            {
              $lookup: {
                from: "category",
                localField: "_id",
                foreignField: "segment_id",
                as: "category_info"
              }
            },
            {
              $unwind: {
                path: "$category_info"
              }
            },
            { $match: { "category_info.name": { $regex: element.category_name, $options: 'i' }, "category_info.is_active": true, "category_info.is_deleted": false } },
            { $project: { category_id: "$category_info._id" } }
          ], (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result.length) {
              let requestedData = ({
                question: element.question,
                answer: element.answer,
                link: (element.link) ? element.link : null,
                image_url: (element.media_type && element.media_type == 'image') ? element.media_url : null,
                video_url: (element.media_type && element.media_type == 'video') ? element.media_url : null,
                view_count: 0,
                category_id: result[0].category_id,
              })
              _faq.model.insertMany(
                requestedData
              )
            }


          })
    }
    return done(null, "Success")
  }
  modifyFAQ(query, done) {
    let _faq = new FAQ();
    let userQuery = ({
      _id: query.id
    })
    delete query.id
    _faq.model.findOneAndUpdate(
      userQuery,
      {
        $set: query
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
  getFAQByID(query, done) {
    let _faq = new FAQ();
    let userQuery = ({
      _id: query.id
    })
    _faq.model.findOne(
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
  getFAQByCategoryID(query, done) {
    let _faq = new FAQ();
    let userQuery = ({
      category_id: query.id
    })
    if (query.question)
      userQuery.question = ({ $regex: query.question, $options: 'i' })
    _faq.model.findOne(
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
  addUserRecentSearch(query, done) {
    let _userRecentSearch = new UserRecentSearch();
    let searchQuery = '^' + query.question + '$'
    _userRecentSearch.model.update(
      { can_id: query.can_id },
      {
        $pull: { search_info: { $regex: searchQuery, $options: 'i' } }
      }, (err, result) => {
        if (err) {
          return done(err);
        } else {
          _userRecentSearch.model.update(
            { can_id: query.can_id },
            {
              $push: {
                search_info: {
                  $each: [query.question],
                  $position: 0,
                  $slice: 5

                }
              }
            }, { upsert: true }, (err1, result1) => {
              if (err1) {
                return done(err1);
              } else {
                return done(null, result1);
              }
            })
        }
      })
  }
  getUserRecentSearch(query, done) {
    let _userRecentSearch = new UserRecentSearch();
    _userRecentSearch.model.findOne(
      { can_id: query.can_id },
      (err, result) => {
        if (err) {
          return done(err);
        } else {
          return done(null, result);
        }
      })
  }
  getFAQBySegmentID(query, done) {
    let _faq = new FAQ();
    let _segment = new Segment();
    let userQuery = ({
      category_id: query.id
    })
    let matchSearch = { $match: { $expr: { '$eq': ['$category_id', '$$category_id'] } } }
    if (query.question)
      matchSearch = { $match: { $expr: { '$eq': ['$category_id', '$$category_id'] }, "question": { $regex: query.question, $options: 'i' } } }
    _segment.model.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(query.id) } },
      {
        $lookup: {
          from: "category",
          localField: "_id",
          foreignField: "segment_id",
          as: "category_info"
        }
      },
      {
        $unwind: {
          path: "$category_info"
        }
      },
      {
        $lookup: {
          from: "faq",
          let: {
            category_id: '$category_info._id'
          },
          pipeline: [
            matchSearch,
            {
              $sort: { view_count: -1 }
            }
          ],
          as: "faq_info"
        }
      },


    ], (err, result) => {
      if (err) {
        return done(err);
      } else {
        return done(null, result);
      }
    })
    // _faq.model.findOne(
    //   userQuery,
    //   (err, result) => {
    //     if (err) {
    //         return done(err);
    //     }else{
    //       return done(null, result);
    //     }
    //   }
    // )  
  }
  getFAQBySegmentName(query, done) {
    let _faq = new FAQ();
    let _segment = new Segment();
    let userQuery = ({
      name: query.name
    })
    let matchSearch = { $match: { $expr: { '$eq': ['$category_id', '$$category_id'] } } }
    if (query.question)
      matchSearch = { $match: { $expr: { '$eq': ['$category_id', '$$category_id'] }, "question": { $regex: query.question, $options: 'i' } } }

    _segment.model.aggregate([
      { $match: userQuery },
      {
        $lookup: {
          from: "category",
          localField: "_id",
          foreignField: "segment_id",
          as: "category_info"
        }
      },
      {
        $unwind: {
          path: "$category_info"
        }
      },
      {
        $lookup: {
          from: "faq",
          let: {
            category_id: '$category_info._id'
          },
          pipeline: [
            matchSearch,
            {
              $project: {
                thumb_up_count: { $cond: { if: { $isArray: "$thumb_up" }, then: { $size: "$thumb_up" }, else: "0" } },
                thumb_down_count: { $cond: { if: { $isArray: "$thumb_down" }, then: { $size: "$thumb_down" }, else: "0" } },
                _id: 1,
                question: 1,
                answer: 1,
                link: 1,
                image_url: 1,
                video_url: 1,
                view_count: 1,
                category_id: 1,
                is_active: 1
              }
            }
          ],
          as: "faq_info"
        }
      },
      {
        $unwind: {
          path: "$faq_info"
        }
      },
      {
        $sort: { "faq_info.view_count": -1 }
      },
      {
        $project: {
          faq_info: 1,
          category_info: 1,
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
  getFAQList(query, done) {
    let _faq = new FAQ();
    let userQuery = ({})
    if (query.question)
      userQuery = ({ question: { $regex: query.question, $options: 'i' } })
    _faq.model.find(
      {},
      (err, result) => {
        if (err) {
          return done(err);
        } else {
          return done(null, result);
        }
      }
    )
  }

  getTop5FAQList(query, done) {
    let _faq = new FAQ();
    let _segment = new Segment();
    let userQuery = ({
      category_id: query.id
    })
    let matchSearch = { $match: { $expr: { '$eq': ['$category_id', '$$category_id'] } } }
    if (query.question)
      matchSearch = { $match: { $expr: { '$eq': ['$category_id', '$$category_id'] }, "question": { $regex: query.question, $options: 'i' } } }
    _segment.model.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(query.id) } },
      {
        $lookup: {
          from: "category",
          localField: "_id",
          foreignField: "segment_id",
          as: "category_info"
        }
      },
      {
        $unwind: {
          path: "$category_info"
        }
      },
      {
        $lookup: {
          from: "faq",
          let: {
            category_id: '$category_info._id'
          },
          pipeline: [
            matchSearch,
            {
              $project: {
                thumb_up_count: { $cond: { if: { $isArray: "$thumb_up" }, then: { $size: "$thumb_up" }, else: "0" } },
                thumb_down_count: { $cond: { if: { $isArray: "$thumb_down" }, then: { $size: "$thumb_down" }, else: "0" } },
                _id: 1,
                question: 1,
                answer: 1,
                link: 1,
                image_url: 1,
                video_url: 1,
                view_count: 1,
                category_id: 1,
                is_active: 1
              }
            }
          ],
          as: "faq_info"
        }
      },
      {
        $unwind: {
          path: "$faq_info"
        }
      },
      {
        $sort: { "faq_info.view_count": -1 }
      },
      {
        $limit: 5
      },
      { $replaceRoot: { newRoot: "$faq_info" } }
    ], (err, result) => {
      if (err) {
        return done(err);
      } else {
        return done(null, result);
      }
    })
    // let _faq = new FAQ();
    // _faq.model.find(
    //   {},
    //   (err, result) => {
    //     if (err) {
    //       return done(err);
    //     } else {
    //       return done(null, result);
    //     }
    //   }
    // ).sort({ "view_count": -1 }).limit(5)
  }
  activateDeactivate(query, done) {
    let _faq = new FAQ();
    _faq.model.findOneAndUpdate(
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
  thumbsUp(query, done) {
    let _faq = new FAQ();
    _faq.model.findOne(
      {
        $and: [
          { _id: query.faq_id },
          {
            $or: [
              { "thumb_up.can_id": query.can_id },
              { "thumb_down.can_id": query.can_id }
            ]
          }
        ]
      },
      (err, result) => {
        if (err) {
          return done(err);
        } else {
          if (result)
            return done("Invalid Request");
          else {
            _faq.model.findOneAndUpdate(
              { _id: query.faq_id },
              { "$push": { "thumb_up": { "can_id": query.can_id } } },
              { new: true },
              (err1, result1) => {
                if (err1) {
                  return done(err1);
                } else {
                  return done(null, result1);
                }
              }
            )
          }
        }
      }
    )
  }
  getThumbsCount(query, done) {
    let _faq = new FAQ();
    _faq.model.count(
      {
        $and: [
          { _id: query.faq_id },
          {
            $or: [
              { "thumb_up.can_id": query.can_id },
              { "thumb_down.can_id": query.can_id }
            ]
          }
        ]
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
  thumbsDown(query, done) {
    let _faq = new FAQ();
    _faq.model.findOne(
      {
        $and: [
          { _id: query.faq_id },
          {
            $or: [
              { "thumb_up.can_id": query.can_id },
              { "thumb_down.can_id": query.can_id }
            ]
          }
        ]
      },
      (err, result) => {
        if (err) {
          return done(err);
        } else {
          if (result)
            return done("Invalid Request");
          else {
            _faq.model.findOneAndUpdate(
              { _id: query.faq_id },
              { "$push": { "thumb_down": { "can_id": query.can_id, "reason": query.reason } } },
              { new: true },
              (err1, result1) => {
                if (err1) {
                  return done(err1);
                } else {
                  return done(null, result1);
                }
              }
            )
          }
        }
      }
    )
  }
  viewIncrement(query, done) {
    let _faq = new FAQ();
    _faq.model.findOneAndUpdate(
      { _id: query.id },
      { $inc: { 'view_count': 1 } },
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

export default new FAQService();
