import Boom from "boom";
import { has } from "config";
// import Notification from "../../../models/notification";
import NotificationHelper from "../../../helper/notification";
import Notification from "../../../models/notification";
import BulkUploadStatus from "../../../models/bulkUploadStatus";
var axios = require('axios');
import Config from "config";


export class NotificationService {
  sendDynamicPushNotification(query, done) {
    let _notification = new Notification()
    if (query.device_tokens && query.device_tokens.length) {
      //       to":"fdz4b9HhbrjI:APA91bFYZUV-u3S6bC4NUmCHqnngwwESHtwl9Tz1d3xqxbpnvFxgFHaBNW84WUdEGOikoQQ0kqeSjWqDyyFQLddWYtwYvjK2o1s650CSuadurHDz1z-72N-xcIohI2KXemxNwLBjf0G7",
      // 
      // "
      // "notification":{
      // "body":"This is an FCM notification that displays an image.!",
      // "title":"FCM Notification",
      // "":"https://picsum.photos/200/300.jpg",
      // "":"https://picsum.photos/200/300.jpg"
      // },

      // "data":{
      // "message":"This is an FCM notification that displays an image.!",
      // "title":"FCM Notification",
      // "can_id":"188500",
      // "_id":"1234567",
      // "order_info":{"detailed_description":"string",
      // "sort_description":"string",
      // "title":"string",
      // "type":"genral"
      // }
      // }
      let message = ({
        to: query.device_tokens[0],
        content_available: true,
        mutable_content: true,
        priority: 'high',
        notification: {
          title: query.notification_info.title,
          body: query.notification_info.sort_description,
          sound: 'default',
          image_url: query.image_url,
          image: query.image_url
        },
        aps: {
          alert: {
            body: query.notification_info.sort_description,
            title: query.notification_info.title
          },
          "mutable-content": 1
        },
        data: {
          order_info: query.notification_info,
          pdf_url: query.pdf_url,
          image_url: query.image_url
        }
        // data: query.notification_info
      })


      console.log("Push message:==> ", message)
      let notificationInfo = message
      notificationInfo.can_id = query.can_id
      if (query.pdf_url) {
        notificationInfo.pdf_url = query.pdf_url
        message.data.pdf_url = query.pdf_url
      }
      if (query.image_url) {
        notificationInfo.c = query.image_url
        message.data.image_url = query.image_url
      }
      _notification.model.insertMany(
        notificationInfo,
        { new: true },
        (err, result) => {
          if (err) {
            return done(err);
          }
          // return done(null, result);
          message.data._id = result[0].id
          message.data.can_id = query.can_id
          let tokens = query.device_tokens
          for (let index = 0; index < tokens.length; index++) {
            let element = tokens[index];
            message.to = element
            NotificationHelper.sendPush(message, (err, result1) => {
              NotificationHelper.sendPushAndRoid(message, (err, result1) => {
                // if(err){
                //   console.log("Push Error",err)
                //   done(err)
                // }
                // else{
                //   console.log("Push result",result)
                //   done(result)
                // }
              })
              if (err) {
                console.log("Push Error", err)
                // done(err)
              }
              else {
                console.log("Push result", result)

              }
            })

          }
          done(result)

        });

    }
  }
  testNotification(query, done) {
    let message = ({
      //to: query.device_token,
      registration_ids: ["eBo16VxLQkmR1s2RCZhTjC:APA91bGlvCwycvTDR9HoIBU9_ExI3R9V8LfypPyHGLikE5ek8S6qlgZngwxtIsGQrPcb-p8gEsElPsr8ch4vHoKsSMGDBRHMdiw85BH-gJS7Ssw4cVZQs3o9yDh62W2CiVtcHBNLupg0", "dz4b9HhbrjI:APA91bFYZUV-u3S6bC4NUmCHqnngwwESHtwl9Tz1d3xqxbpnvFxgFHaBNW84WUdEGOikoQQ0kqeSjWqDyyFQLddWYtwYvjK2o1s650CSuadurHDz1z-72N-xcIohI2KXemxNwLBjf0G7"],
      priority: 'high',
      notification: {
        title: 'order created',
        body: 'Order is ready to dispatch',
        sound: 'default'
      },
      data: {}
    })
    NotificationHelper.sendPush(message, (err, result) => {
      if (err)
        done(err)
      else
        done(null, result)
    }
    )
  }
  readNotification(query, done) {
    let _notification = new Notification()
    let notificationIDs = query._id.split(',')
    _notification.model.updateMany(
      { _id: notificationIDs },
      { $set: { is_read: true } },
      (err, result) => {
        if (err) {
          return done(err);
        }
        return done(null, result);
      });
  }
  archieveNotification(query, done) {
    let _notification = new Notification()
    let notificationIDs = query._id.split(',')
    _notification.model.updateMany(
      { _id: notificationIDs },
      { $set: { is_archieved: true } },
      (err, result) => {
        if (err) {
          return done(err);
        }
        return done(null, result);
      });
  }
  deleteNotification(query, done) {
    let _notification = new Notification()
    let notificationIDs = query._id.split(',')
    _notification.model.deleteMany(
      { _id: notificationIDs },
      (err, result) => {
        if (err) {
          return done(err);
        }
        return done(null, result);
      });
  }
  searchNotifications(query, done) {
    let _notification = new Notification()
    let canID = query.can_id.split(',')
    _notification.model.find(
      {
        can_id: { $in: canID },
        $or: [{ "data.order_info.title": { $regex: query.search_keyword, $options: "si" } }, { "data.order_info.sort_description": { $regex: query.search_keyword, $options: "si" } }, { "data.order_info.detailed_description": { $regex: query.search_keyword, $options: "si" } }]
        // "data.order_info.title": { $regex: query.search_keyword, $options: "si" } 
      },
      { to: 0, "data.xls_data": 0 },
      (err, result) => {
        if (err) {
          return done(err);
        }
        return done(null, result);
      }).sort({ created_at: -1 });
  }
  addNewNotification(query, done) {
    //xls_data
    // detailed_description:'d'
    // img_url:'https://storage.googleapis.com/digitalmallofasia/1609136606846.png'
    // pdf_url:''
    // sort_description:'s'
    // title:'t'
    // type:'tr'
    // user_file:''
    // video_url:'v'
    // {
    //   "can_id": "string",
    //   "image_url": "string",
    //   "pdf_url": "string",
    //   "device_tokens": [
    //     "string"
    //   ],
    //   "notification_info": {
    //     "title": "string",
    //     "sort_description": "string",
    //     "detailed_description": "string",
    //     "type": "string"
    //   }
    // }

    let user_data = query
    let order_info = ({
      "title": user_data.title,
      "sort_description": user_data.sort_description,
      "detailed_description": user_data.detailed_description,
      "type": user_data.type
    })
    let refrence_id = new Date()
    refrence_id = refrence_id.getTime()
    // user_data.device_tokens = ["string"]
    // user_data.can_id = "can_id"
    let xls_data = user_data.xls_data
    for (let index = 0; index < xls_data.length; index++) {
      let element = xls_data[index];
      // user_data.device_tokens = element.token.split(",")
      user_data.device_tokens = element.deviceToken
      user_data.can_id = element.canId
      let _notification = new Notification()
      if (user_data.device_tokens && user_data.device_tokens.length) {
        let message = ({
          // to: user_data.device_tokens[0],
          priority: 'high',
          refrence_id: refrence_id,
          notification: {
            title: user_data.title,
            body: user_data.sort_description,
            sound: 'default'
          },
          data: {
            order_info: order_info,
            xls_data: user_data.xls_data,
            pdf_url: user_data.pdf_url,
            image_url: user_data.image_url,
            video_url: user_data.video_url
          }
          // data: query.notification_info
        })


        console.log("Push message:==> ", message)
        let notificationInfo = message
        message.notification.click_action = "Notification"
        notificationInfo.can_id = user_data.can_id
        if (query.pdf_url) {
          notificationInfo.pdf_url = query.pdf_url
          message.data.pdf_url = query.pdf_url
        }
        if (query.image_url) {
          notificationInfo.image_url = query.image_url
          message.notification.image = query.image_url
          message.data.image_url = query.image_url
        }
        if (query.user_file) {
          notificationInfo.user_file = query.user_file
          message.data.user_file = query.user_file
        }
        if (query.video_url) {
          notificationInfo.video_url = query.video_url
          message.data.video_url = query.video_url
        }
        _notification.model.insertMany(
          notificationInfo,
          { new: true },
          (err, result) => {
            if (err) {
              return done(err);
            }
            // return done(null, result);
            let elementToken = element.deviceToken
            message.data._id = result[0].id
            message.data.can_id = element.canId
            message.registration_ids = elementToken
            delete message.data.xls_data
            NotificationHelper.sendPush(message, (err, result1) => {
              if (err) {
                console.log("Push Error", err)
                // done(err)
              }
              else {
                console.log("Push result", result)
                // done(result)
              }
            })
            // for (let index1 = 0; index1 < elementToken.length; index1++) {
            //   let tokenElement = elementToken[index1];
            //   message.to = tokenElement
            //   NotificationHelper.sendPush(message, (err, result1) => {
            //     if(err){
            //       console.log("Push Error",err)
            //       // done(err)
            //     }
            //     else{
            //       console.log("Push result",result)
            //       // done(result)
            //     }
            //   })

            // }   
          });
        // let notificationInfo1 = user_data.xls_data
        // for (let index = 0; index < notificationInfo1.length; index++) {
        //   let element = notificationInfo1[index];


        // }



      }
    }
    let _bulkUploadStatus = new BulkUploadStatus()
    _bulkUploadStatus.model.findOneAndUpdate(
      { file_url: user_data.user_file },
      { status: 'completed' },
      (err, result) => {
        if (err) {
          console.log(err);
        }
      })

    return done(null, "File Uploaded");
  }
  getAllNotificationsByID(query, done) {
    let _notification = new Notification()
    // query.is_archieved = false
    _notification.model.find(
      query,
      (err, result) => {
        if (err) {
          return done(err);
        }
        return done(null, result);
      });
  }

  getBulkUploadStatus(query, done) {
    let _bulkUploadStatus = new BulkUploadStatus()
    _bulkUploadStatus.model.findOne(
      query,
      (err, result) => {
        if (err) {
          return done(err);
        }
        return done(null, result);
      });
  }

  getAllNotificationsList(query, done) {
    let _notification = new Notification()
    let limit = (query.limit) ? query.limit : 1000
    let skip = (query.skip) ? query.skip : 0
    skip = Number(skip)
    limit = Number(limit)
    _notification.model.aggregate([
      {
        "$match": {
          "refrence_id": {
            "$exists": true,
            "$ne": null
          }
        }
      },
      // { $sort : { created_at : -1 } },  
      {
        $group: {
          _id: { refrence_id: "$refrence_id" },
          to: { $first: "$to" },
          can_id: { $first: "$can_id" },
          priority: { $first: "$priority" },
          notification: { $first: "$notification" },
          data: { $first: "$data" },
          is_archieved: { $first: "$is_archieved" },
          user_file: { $first: "$is_archieved" },
          is_read: { $first: "$is_read" },
          id: { $first: "$_id" },
          image_url: { $first: "$image_url" },
          pdf_url: { $first: "$pdf_url" },
          refrence_id: { $first: "$refrence_id" },
          created_at: { $first: "$created_at" }
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },

    ],
      function (err, result) {
        if (err) {
          return done(err);
        }
        else {
          _notification.model.aggregate([
            {
              "$match": {
                "refrence_id": {
                  "$exists": true,
                  "$ne": null
                }
              }
            },
            {
              $group: {
                _id: { refrence_id: "$refrence_id" },
              }
            },
            {
              $count: "total_count",
            },
          ],
            function (err, result1) {
              if (err) {
                return done(err);
              }
              let totalCount = (result1.length && result1[0].total_count) ? result1[0].total_count : 0
              return done(null, result, totalCount, "Notification List.");
            })
        }
      })
    // query.is_archieved = false
    // _notification.model.find(
    //   {is_archieved: query.is_archieved},         
    //   (err, result) => {
    //     if (err) {
    //         return done(err);
    //     }
    //     _notification.model.count(
    //       {is_archieved: query.is_archieved},         
    //     (err, result1) => {
    //       if (err) {
    //           return done(err);
    //       }
    //       let resultData = result
    //       resultData[0].total_count = result1
    //       return done(null, resultData);
    //     })

    // }).skip(skip).limit(limit).sort({created_at : -1}).lean();
  }
  getNotificationsAnalytics(query, done) {
    let _notification = new Notification()
    // query.is_archieved = false
    _notification.model.find(
      query,
      (err, result) => {
        if (err) {
          return done(err);
        }
        let total_user = 0
        let device_ids = 0
        let notification_read = 0

        for (let index = 0; index < result.length; index++) {
          let element = result[index];
          if (element.data.xls_data.length)
            device_ids = device_ids + element.data.xls_data[0].deviceToken.length
          if (element.is_read)
            notification_read = notification_read + 1
        }
        total_user = result.length

        let responseData = ({
          total_user: total_user,
          device_ids: device_ids,
          notification_read: notification_read
        })
        // return done(null, result);
        return done(null, responseData);
      });
  }
  getAllNotifications(query, done) {
    //is_admin_request
    let _notification = new Notification()
    let can_id = query.can_id.split(",")
    let is_archieved = (query.is_archieved) ? true : false
    let limit = (query.limit) ? query.limit : 1000
    let skip = (query.skip) ? query.skip : 0
    skip = Number(skip)
    limit = Number(limit)
    _notification.model.aggregate([
      { $match: { can_id: { $in: can_id }, is_archieved: is_archieved } },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { to: 0, "data.xls_data": 0 } },
      {
        $group: {
          _id: { month: { $month: "$created_at" }, day: { $dayOfMonth: "$created_at" }, year: { $year: "$created_at" } },
          notification_info: {
            $push: {
              to: "$to",
              can_id: "$can_id",
              priority: "$priority",
              notification: "$notification",
              data: "$data",
              is_archieved: "$is_archieved",
              is_read: "$is_read",
              _id: "$_id",
              image_url: "$image_url",
              pdf_url: "$pdf_url",
              refrence_id: "$refrence_id"
            }
          },
          created_at: { $first: "$created_at" }
        }
      },
      { $sort: { created_at: -1 } },
    ],
      function (err, result) {
        if (err) {
          return done(err);
        }
        else {
          _notification.model.aggregate([
            { $match: { can_id: { $in: can_id }, is_archieved: is_archieved } },
            {
              $count: "total_count",
            },
          ],
            function (err, result1) {
              if (err) {
                return done(err);
              }
              let totalCount = (result1.length && result1[0].total_count) ? result1[0].total_count : 0
              return done(null, result, totalCount, "Notification List.");
            })
        }
      })
  }
}

export default new NotificationService();
