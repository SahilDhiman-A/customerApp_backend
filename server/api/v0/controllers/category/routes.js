import Express from "express";
import controller from "./controller";
import authorizationController from "../authorization/controller";
import authenticationController0 from "../authentication/controller";

export default Express.Router()
  .post("/addnewcategory", authenticationController0.verifyToken, controller.createNewCategory)
  .put("/modifycategory", authenticationController0.verifyToken, controller.modifyCategory)
  .put("/activatedeactivate?", authenticationController0.verifyToken, controller.activateDeactivate)
  .get("/getcategorybyid/:id", controller.getCategoryByID)
  .get("/getcategorybysegmentid/:id", controller.getCategoryBySegmentID)
  .get("/getcategorylist", controller.getCategoryList)
