import Boom from "boom";
import User from "../../../models/user";
import NotificationHelper from "../../../helper/notification";
import mongoose from "mongoose";
import { has } from "config";
import Config from "config";
let jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
let secret = Config.get("jwtsecret");
var axios = require('axios');
let saltRounds = 10;

export class UserService {
  addNewUser(query, done){
    const _user = new User();
    bcrypt.hash(query.password,saltRounds,(err, encodedPassword) => {
      query.password = encodedPassword
    _user.model.insertMany(
        query,         
        (err, result) => {
          if (err) {
              return done(err);
          }
          return done(null, result);
      });
    });    
  }
  updateProfile(query, done){
    // let profileInfo = ({
    //   user_name:  (query.user_name)?query.user_name:null,
    //   profile_img:  (query.profile_img)?query.profile_img:null,
    //   city:  (query.city)?query.city:null,
    //   lat:  (query.lat)?query.lat:null,
    //   long:  (query.long)?query.long:null
    // })
    const _user = new User();
    let userQuery = ({
      _id: query.user_id})    
    _user.model.findOneAndUpdate(
      userQuery,
      {$set:
        {"personal_info.user_name": query.user_name}
      },
      { new: true },
      (err, result) => {
        if (err) {
            return done(err);
        }else{
          return done(null, result);
        }
      }
    )      
  }
  getProfile(query, done){
    const _user = new User();
    let userQuery = ({
      _id: query.user_id})
    _user.model.findOne(
      userQuery,
      { password: 0},
      (err, result) => {
        if (err) {
            return done(err);
        }else{
          return done(null, result);
        }
      }
    )  
  } 
  resetPassword(query, done){
    const _user = new User();
    _user.model.findOneAndUpdate(
      {_id:query.user_id,password:query.old_password},
      {$set:
        {password:query.new_password}
      },
      { new: true },
      (err, result) => {
        if (err) {
            return done(err);
        }else{
          if(result)
            return done(null, result);
          else
          return done("Old Password is incorrect");
        }
      }
    )    
  }
  deactivateUserAccount(userId, done){
    const _user = new User();
    _user.model.findOneAndUpdate(
      {_id:userId},
      {$set:
        {is_active:false}
      },
      { new: true },
      (err, result) => {
        if (err) {
            return done(err);
        }else{
          NotificationHelper.sendEmail("Your Account has been deactivated","Account Deactivated",result.email,(err, result) => {
            console.log('Hi')
          }
          )
          return done(null, result);
        }
      }
    )    
  }
  login(query, done){
    const _user = new User();
    _user.model.findOne(
      query,        
        (err, result) => {
          if (err) {
              return done(err);
          }
          if(result && result.is_active){
              let responseData = ({})  
              let user = ({
                mobile: result.mobile,
                user_id: result.id,
                email: result.email,
                password: query.password
              })
              let token = jwt.sign(user, secret, {expiresIn: "30 days"});
              responseData = ({
                  token : token,
                  user_info: result
              })
              return done(null, responseData,"Successfully Login.");
          }
          if(result && !result.is_active){
            return done("Account has been deactivated !!.",null);
          }
          else{
            return done("Invalid User Name/Password !!.",null);
          }
      });
  }
  userValidation (queryPassword, userInfo, done){
    const _user = new User();
    _user.model.updateMany(
      {user_name: userInfo.user_name},  
      {$set:{password:queryPassword}} ,    
        (err, result) => {
          if (err) {
              return done(err);
          }
          let user = ({
            user_name: userInfo.user_name,
            user_id: userInfo.id,
            user_balance: userInfo.user_balance
          })
          let token = jwt.sign(user, secret, {expiresIn: "30 days"});
          let responseData = ({
              token : token,
              user_info: user
          })                
          return done(null, responseData,"Successfully Login.");
      });
  }
}

export default new UserService();
