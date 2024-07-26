import Express from "express";
import controller from "./controller";
import authorizationController from "../authorization/controller";
import authenticationController0 from "../authentication/controller";

export default Express.Router()
  .post("/login",controller.login)
  .get("/getprofile",authenticationController0.verifyToken,controller.getProfile)
  .post("/updateprofile",authenticationController0.verifyToken, controller.updateProfile)
  .post("/deactivate",authenticationController0.verifyToken,controller.deactivateUserAccount)
  .post("/resetpassword",authenticationController0.verifyToken,controller.resetPassword)  