import Boom from "boom";
import Segment from "../../../models/segment";
import mongoose from "mongoose";
import { has } from "config";
import Config from "config";

export class SegmentService {
  addNewSegmen(query, done){
    let _segment = new Segment();
    _segment.model.insertMany(
      query,         
      (err, result) => {
        if (err) {
            return done(err);
        }
        return done(null, result);
    });   
  }
  modifySegment(query, done){
    let _segment = new Segment();
    let userQuery = ({
      _id: query.id})    
    _segment.model.findOneAndUpdate(
      userQuery,
      {$set:
        {"name": query.name}
      },
      (err, result) => {
        if (err) {
            return done(err);
        }else{
          return done(null, result);
        }
      }
    )      
  }
  getSegmentByID(query, done){
    let _segment = new Segment();
    let userQuery = ({
      _id: query.id})
    _segment.model.findOne(
      userQuery,
      (err, result) => {
        if (err) {
            return done(err);
        }else{
          return done(null, result);
        }
      }
    )  
  }
  getSegmentList(query, done){
    let _segment = new Segment();
    _segment.model.find(
      {},
      (err, result) => {
        if (err) {
            return done(err);
        }else{
          return done(null, result);
        }
      }
    )  
  }

  activateDeactivate(query, done){
    let _segment = new Segment();
    _segment.model.findOneAndUpdate(
      {_id:query.id},
      {$set:
        {is_active:query.is_active}
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


}

export default new SegmentService();
