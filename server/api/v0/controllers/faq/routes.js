import Express from "express";
import controller from "./controller";
import authorizationController from "../authorization/controller";
import authenticationController0 from "../authentication/controller";
import uploadHandler from "../../../../helper/uploadHandler";
import fileUpload from "../../../../helper/fileUploadHandler";

export default Express.Router()
  .post("/addnewfaq", authenticationController0.verifyToken, uploadHandler.uploadFile, controller.createNewFAQ)
  .post("/bulkuploadfaq", authenticationController0.verifyToken, fileUpload.uploadFile, controller.bulkUploadFAQ)
  .put("/modifyfaq", authenticationController0.verifyToken, uploadHandler.uploadFile, controller.modifyFAQ)
  .put("/activatedeactivate?", authenticationController0.verifyToken, controller.activateDeactivate)
  .put("/viewincrement?", controller.viewIncrement)
  .get("/getfaqbyid/:id?", authenticationController0.verifyToken, controller.getFAQByID)
  .get("/getfaqbycategoryid/:id?", authenticationController0.verifyToken, controller.getFAQByCategoryID)
  .get("/getfaqbysegmentid/:id/:can_id?", controller.getFAQBySegmentID)
  .get("/getfaqbysegmentname/:name?", controller.getFAQBySegmentName)
  .get("/getfaqlist?", authenticationController0.verifyToken, controller.getFAQList)
  .get("/gettop5faqlist/:id?", controller.getTop5FAQList)
  .put("/thumbsup?", controller.thumbsUp)
  .put("/thumbsdown?", controller.thumbsDown)
  .get("/getthumbscount?", controller.getThumbsCount)
  .get("/getrecentsearchlist/:can_id", controller.getRecentSearchList)
