import Express from "express";
import controller from "./controller";
import authenticationController0 from "../authentication/controller";
import fileUpload from "../../../../helper/fileUploadHandler";
//import fileUpload from "../../../../helper/fileUploadHandler";

export default Express.Router()

  .get("/testnotification?", controller.testNotification)
  .post("/dynamicnotificationsent", controller.dynamicNotificationSent)
  .post("/addnewnotification", fileUpload.uploadFile, controller.addNewNotification)
  .get("/getallnotifications?", controller.getAllNotifications)
  .get("/getnotificationsanalytics?", controller.getNotificationsAnalytics)
  .get("/getallnotificationslist?", controller.getAllNotificationsList)
  .get("/getnotificationsbyid?", controller.getNotificationsByID)
  .get("/getbulkuploadstatus?", controller.getBulkUploadStatus)
  .get("/getallarchievenotifications?", controller.getAllArchieveNotifications)
  .get("/searchnotification?", controller.searchNotification)
  .delete("/deletenotifications?", controller.deleteNotifications)
  .put("/archievenotifications?", controller.archieveNotifications)
  .put("/readnotifications?", controller.readNotifications)