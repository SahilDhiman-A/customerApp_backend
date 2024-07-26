import Joi from "joi";
import Async from "async";
import Boom from "boom";
import _ from "lodash";
import Config from "config";
import FCM from 'fcm-node';
const serverKey = Config.get('fcm_serverkey')
const fcm = new FCM(serverKey);

export class NotificationHelper {
  sendPush(message, done){
      fcm.send( message,function(err, response){
          if (err) {
            done(err);
          } else {
            done(null,{status:200,message:"Notification Sent Successfully"});
          }
        }
        );
      }
    sendPushAndRoid(message, done){
      const serverKeyAndRoid = Config.get('fcm_serverkey_andRoid')
      const fcmAndRoid = new FCM(serverKeyAndRoid);
      fcmAndRoid.send( message,function(err, response){
          if (err) {
            done(err);
          } else {
            done(null,{status:200,message:"Notification Sent Successfully"});
          }
        }
        );
      }
  }

export default new NotificationHelper();
