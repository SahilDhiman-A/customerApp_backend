import Joi from "joi";
import Async from "async";
import Boom from "boom";
import _ from "lodash";
import Path from "path";
import Config from "config";
import Response from "../../../../models/response";
import UserService from "../../services/user.services";
import jwt from "jsonwebtoken";
import makeRequest from "request";
import crypto from "crypto";
import fetch from 'node-fetch';

export class UserController {
  addNewUser(request, response, next) {
    const validationSchema = {
      user_name: Joi.string().required().trim(),
      password:  Joi.string().optional().trim(),
    };
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.body, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "User Not Created Successfully!!"));
          next();
        }else{
          UserService.addNewUser(request.body, (err, user) => {
            if (err) {
              return response.json(new Response(err, "User Not Created Successfully!!"));
            } else {
              return response.json(new Response(null, "User Created Successfully!!"));
            }
          })
        }
      }
    );
  }
  /**
   * @swagger
   * /user/login:
   *   post:
   *     tags:
   *       - Application User
   *     description: User  Login/Signup
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user info
   *         in: body
   *         schema:
   *          $ref: '#/definitions/UserLoginInfo'
   *          description: User Login Info.
   *     responses:
   *       200:
   *         description: Returns success message
   */
  login(request, response, next) {
    const validationSchema = {
      email: Joi.string().required(),
      password:  Joi.string().required(),
      user_type:  Joi.string().optional()
    };
    
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.body, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error) {
          return response.json(new Response(error, "Invalid User!!"));
          next();
        }else{
          let requestedData = request.body
          UserService.login(requestedData, (err, user) => {
            if (err) {
              return response.json(new Response(null, err,401));
            } else {
              return response.json(new Response((user)?user:null,"Login Success."));              
            }
          })
        }
      }
    );
  }
    /**
   * @swagger
   * /user/updateprofile:
   *   post:
   *     tags:
   *       - Application User
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Update User Address
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: X-Source
   *         in: header
   *         required: true
   *         type: string
   *         description: Source Name.
   *       - name: user_name
   *         in: query
   *         type: string
   *         description: New User Name.
   *     responses:
   *       200:
   *         description: Returns success message
   */
  updateProfile(request, response, next) {
    // let finalUrl = ''
    // if(request.files && request.files.length){
    //   const requestedFile = request.files[0];
    //   let fileData = requestedFile.buffer
    //   let base64data = new Buffer.from(fileData, 'binary');  
    //   var d = new Date();
    //   let fileName = d.getTime() + '.' + requestedFile.mimetype.split('image/')[1]   
    //   finalUrl = FileUpload.uploadFile(fileName,base64data)
    //   finalUrl = `https://storage.googleapis.com/digitalmallofasia/${fileName}`
    // }
    const validationSchema = ({
      user_name:  Joi.string().required(),
      // profile_img:  Joi.string().optional(),
      // city:  Joi.string().optional(),
      // lat:  Joi.number().optional(),
      // long:  Joi.number().optional(),
      // email:  Joi.string().optional()
    })

    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.query, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error || !(request.decoded) || !(request.decoded.user_id)) {
          return response.json(new Response(error, "Invalid Request!!",400));
          next();
        }else{
          let requestedData = request.query
          requestedData.user_id = request.decoded.user_id;
          // if(finalUrl){ requestedData.profile_img = finalUrl }
          UserService.updateProfile(requestedData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!",400));
            } else {
              if(user){
                return response.json(new Response(user,"User Profile Updated!!"));               
              }else{
                return response.json(new Response(null, "Invalid Request!!",400));
              }              
            }
          })
        }
      }
    );
  }
    /**
   * @swagger
   * /user/getprofile:
   *   get:
   *     tags:
   *       - Application User
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Get User Profile
   *     produces:
   *       - application/json
   *     parameters:
   *     responses:
   *       200:
   *         description: Returns success message
   */
  getProfile(request, response, next) {
    const validationSchema = ({

    })
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.body, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error || !(request.decoded) || !(request.decoded.user_id)) {
          return response.json(new Response(error, "Invalid Request!!",400));
          next();
        }else{
          let requestedData = ({
            user_id : request.decoded.user_id
          })
          
          UserService.getProfile(requestedData, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!",400));
            } else {
              if(user){
                return response.json(new Response(user,"User Profile!!"));               
              }else{
                return response.json(new Response(null, "Invalid Request!!",400));
              }              
            }
          })
        }
      }
    );
  }  
    /**
   * @swagger
   * /user/deactivate:
   *   post:
   *     tags:
   *       - Application User
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Deactivate User Account
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: X-Source
   *         in: header
   *         required: true
   *         type: string
   *         description: Source Name.
   *     responses:
   *       200:
   *         description: Returns success message
   */
  deactivateUserAccount(request, response, next) {
    const validationSchema = ({});
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.body, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error || !(request.decoded) || !(request.decoded.user_id)) {
          return response.json(new Response(error, "Invalid Request!!",400));
          next();
        }else{
          UserService.deactivateUserAccount(request.decoded.user_id, (err, user) => {
            if (err) {
              return response.json(new Response(err, "Invalid Request!!",400));
            } else {
              if(user){
                return response.json(new Response(user,"User Profile Updated Successfully!!"));               
              }else{
                return response.json(new Response(null, "Invalid Request!!",400));
              }              
            }
          })
        }
      }
    );
  }
    /**
   * @swagger
   * /user/resetpassword:
   *   post:
   *     tags:
   *       - Application User
   *     security:
   *       - tokenauth: [Authorization]
   *     description: Reset User Password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: X-Source
   *         in: header
   *         required: true
   *         type: string
   *         description: Source Name.
   *       - name: user info
   *         in: body
   *         schema:
   *          $ref: '#/definitions/ResetPassword'
   *          description: User Password Info.
   *     responses:
   *       200:
   *         description: Returns success message
   */
  resetPassword(request, response, next) {
    const validationSchema = ({
      old_password: Joi.string().required(),
      new_password: Joi.string().required()
    });
    Async.auto(
      {
        validatedBody: (cb) => {
          Joi.validate(request.body, validationSchema, cb);
        }
      },
      (error, result) => {
        if (error || !(request.decoded) || !(request.decoded.user_id)) {
          return response.json(new Response(error, "Invalid Request!!",400));
          next();
        }else{
          let requestedData = request.body
          requestedData.user_id = request.decoded.user_id
          UserService.resetPassword(requestedData, (err, user) => {
            if (err) {
              if(err == "Old Password is incorrect")
                return response.json(new Response(null, "Old Password is incorrect",400));
              return response.json(new Response(err, "Invalid Request!!",400));
            } else {
              if(user){
                return response.json(new Response(user,"Password has been changed Successfully!!"));               
              }else{
                return response.json(new Response(null, "Invalid Request!!",400));
              }              
            }
          })
        }
      }
    );
  }
}
export default new UserController();
