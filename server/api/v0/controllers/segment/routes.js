import Express from "express";
import controller from "./controller";
import authorizationController from "../authorization/controller";
import authenticationController0 from "../authentication/controller";

export default Express.Router()
  .post("/addnewsegment", authenticationController0.verifyToken, controller.createNewSegment)
  .put("/modifysegment", authenticationController0.verifyToken, controller.modifySegment)
  .put("/activatedeactivate?", authenticationController0.verifyToken, controller.activateDeactivate)
  .get("/getsegmentbyid/:id", authenticationController0.verifyToken, controller.getSegmentByID)
  .get("/getsegmentlist", controller.getSegmentList)
